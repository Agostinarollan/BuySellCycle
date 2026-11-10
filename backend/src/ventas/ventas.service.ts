import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EstadoVenta,
  ModoPago,
  Prisma,
  TipoEntrega,
  TipoMovimientoStock,
} from '@prisma/client';
import { calcularFinanciacion } from '../common/utils/calculos';
import { ErroresService } from '../errores/errores.service';
import { MailService } from '../mail/mail.service';
import { PdfService } from '../pdf/pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  descontarStockParaVenta,
  marcarMovimiento,
  sincronizarStockProducto,
  sumarStock,
} from '../stock/stock.utils';
import { CambiarEstadoVentaDto } from './dto/cambiar-estado-venta.dto';
import { CreateVentaDto } from './dto/create-venta.dto';
import { INCLUDE_VENTA, VentaCompleta } from './ventas.include';

const Decimal = Prisma.Decimal;

/** Desde cada estado, a qué estados se puede pasar. */
const TRANSICIONES: Record<EstadoVenta, EstadoVenta[]> = {
  EN_PREPARACION: [
    EstadoVenta.DISPONIBLE_PARA_RETIRAR,
    EstadoVenta.EN_CAMINO,
    EstadoVenta.CANCELADO,
  ],
  DISPONIBLE_PARA_RETIRAR: [EstadoVenta.ENTREGADO, EstadoVenta.CANCELADO],
  EN_CAMINO: [EstadoVenta.ENTREGADO, EstadoVenta.CANCELADO],
  ENTREGADO: [],
  CANCELADO: [],
};

export interface ResultadoEmail {
  enviado: boolean;
  previewUrl: string | null;
  error: string | null;
}

@Injectable()
export class VentasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
    private readonly mail: MailService,
    private readonly errores: ErroresService,
  ) {}

  findAll(estado?: EstadoVenta) {
    return this.prisma.venta.findMany({
      where: { archivado: false, estado },
      include: { cliente: true, usuario: true },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async findOne(id: number): Promise<VentaCompleta> {
    const venta = await this.prisma.venta.findFirst({
      where: { id, archivado: false },
      include: INCLUDE_VENTA,
    });
    if (!venta) throw new NotFoundException(`La venta ${id} no existe`);
    return venta;
  }

  // =====================================================================
  //                           GENERAR VENTA
  // =====================================================================
  async create(dto: CreateVentaDto) {
    // ---------- 1) VALIDACIONES (antes de tocar la base) ----------
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: dto.clienteId, archivado: false },
    });
    if (!cliente)
      throw new NotFoundException(`El cliente ${dto.clienteId} no existe`);

    const usuario = await this.prisma.usuario.findFirst({
      where: { id: dto.usuarioId, archivado: false },
    });
    if (!usuario)
      throw new NotFoundException(`El usuario ${dto.usuarioId} no existe`);

    let plan: Prisma.PlanGetPayload<object> | null = null;
    if (dto.modoPago === ModoPago.PLAN) {
      plan = await this.prisma.plan.findFirst({
        where: { id: dto.planId, archivado: false },
      });
      if (!plan) throw new NotFoundException(`El plan ${dto.planId} no existe`);
    }

    if (dto.tipoEntrega === TipoEntrega.RETIRO_SUCURSAL) {
      const sucursal = await this.prisma.sucursal.findFirst({
        where: { id: dto.sucursalId, archivado: false },
      });
      if (!sucursal)
        throw new NotFoundException(`La sucursal ${dto.sucursalId} no existe`);
    }

    const ids = dto.items.map((i) => i.productoId);
    if (new Set(ids).size !== ids.length)
      throw new BadRequestException('Hay productos repetidos en la venta');
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: ids }, archivado: false },
    });
    if (productos.length !== ids.length)
      throw new NotFoundException('Alguno de los productos no existe');

    // ---------- 2) CÁLCULOS con Decimal ----------
    // Contado -> precio contado. Plan -> precio de lista + tasa del plan.
    let subtotal = new Decimal(0);
    const detalles = dto.items.map((item) => {
      const producto = productos.find((p) => p.id === item.productoId)!;
      const precioUnitario =
        dto.modoPago === ModoPago.CONTADO
          ? producto.precioContado
          : producto.precioLista;
      const subtotalItem = precioUnitario.mul(item.cantidad);
      subtotal = subtotal.plus(subtotalItem);
      return {
        productoId: producto.id,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal: subtotalItem,
      };
    });

    let total = subtotal;
    let montoCuota: Prisma.Decimal | null = null;
    if (plan) {
      const financiacion = calcularFinanciacion(
        subtotal,
        plan.tasaFinanciacion,
        plan.cantidadCuotas,
      );
      total = financiacion.total;
      montoCuota = financiacion.montoCuota;
    }

    // ---------- 3) TRANSACCIÓN: venta + detalle + stock ----------
    // Si falta stock de UN producto, se deshace TODO (no queda venta a medias).
    const ventaId = await this.prisma.$transaction(async (tx) => {
      const venta = await tx.venta.create({
        data: {
          clienteId: dto.clienteId,
          usuarioId: dto.usuarioId,
          modoPago: dto.modoPago,
          planId: plan?.id ?? null,
          cantidadCuotas: plan?.cantidadCuotas ?? null,
          tasaFinanciacion: plan?.tasaFinanciacion ?? null,
          tipoEntrega: dto.tipoEntrega,
          sucursalId:
            dto.tipoEntrega === TipoEntrega.RETIRO_SUCURSAL
              ? dto.sucursalId
              : null,
          direccionEntrega:
            dto.tipoEntrega === TipoEntrega.DOMICILIO
              ? dto.direccionEntrega!.trim()
              : null,
          subtotal,
          total,
          montoCuota,
          detalles: { create: detalles },
        },
      });

      for (const item of dto.items) {
        await descontarStockParaVenta(
          tx,
          item.productoId,
          item.cantidad,
          venta.id,
        );
      }
      return venta.id;
    });

    // ---------- 4) DESPUÉS del commit: PDF + email ----------
    // Si el email falla, la venta YA es válida: no se deshace, se informa.
    const email = await this.enviarEmailSeguro(ventaId);
    const venta = await this.findOne(ventaId);
    return { venta, email };
  }

  // =====================================================================
  //                          CAMBIO DE ESTADO
  // =====================================================================
  async cambiarEstado(id: number, dto: CambiarEstadoVentaDto) {
    const venta = await this.findOne(id);

    if (!TRANSICIONES[venta.estado].includes(dto.estado))
      throw new BadRequestException(
        `No se puede pasar de ${venta.estado} a ${dto.estado}`,
      );
    if (
      dto.estado === EstadoVenta.DISPONIBLE_PARA_RETIRAR &&
      venta.tipoEntrega !== TipoEntrega.RETIRO_SUCURSAL
    )
      throw new BadRequestException(
        'Solo las ventas con retiro en sucursal pueden estar disponibles para retirar',
      );
    if (
      dto.estado === EstadoVenta.EN_CAMINO &&
      venta.tipoEntrega !== TipoEntrega.DOMICILIO
    )
      throw new BadRequestException(
        'Solo las ventas con entrega a domicilio pueden estar en camino',
      );

    if (dto.estado !== EstadoVenta.CANCELADO) {
      await this.prisma.venta.update({
        where: { id },
        data: { estado: dto.estado },
      });
      return this.findOne(id);
    }

    // Cancelación: cambia el estado Y devuelve el stock en la MISMA transacción.
    await this.prisma.$transaction(async (tx) => {
      await tx.venta.update({
        where: { id },
        data: {
          estado: EstadoVenta.CANCELADO,
          motivoCancelacion: dto.motivoCancelacion!.trim(),
        },
      });
      const egresos = await tx.movimientoStock.findMany({
        where: { ventaId: id, tipo: TipoMovimientoStock.EGRESO },
      });
      const productosAfectados = new Set<number>();
      for (const egreso of egresos) {
        await sumarStock(
          tx,
          egreso.productoId,
          egreso.depositoOrigenId!,
          egreso.cantidad,
        );
        await tx.movimientoStock.create({
          data: {
            tipo: TipoMovimientoStock.INGRESO,
            cantidad: egreso.cantidad,
            productoId: egreso.productoId,
            depositoDestinoId: egreso.depositoOrigenId,
            ventaId: id,
            observacion: `Cancelación venta #${id}`,
          },
        });
        productosAfectados.add(egreso.productoId);
      }
      for (const productoId of productosAfectados) {
        await marcarMovimiento(tx, productoId);
        await sincronizarStockProducto(tx, productoId);
      }
    });
    return this.findOne(id);
  }

  // =====================================================================
  //                             PDF / EMAIL
  // =====================================================================
  async generarPdf(id: number) {
    const venta = await this.findOne(id);
    return this.pdf.generarPdfVenta(venta);
  }

  /** Reenvío manual: si falla, el error sí se propaga al usuario. */
  async enviarEmail(id: number): Promise<ResultadoEmail> {
    const venta = await this.findOne(id);
    const pdf = await this.pdf.generarPdfVenta(venta);
    const resultado = await this.mail.enviar({
      para: venta.cliente.email,
      asunto: `BuySellCycle - Tu compra N° ${venta.id}`,
      html: this.htmlEmail(venta),
      adjuntos: [{ filename: `venta-${venta.id}.pdf`, content: pdf }],
    });
    await this.prisma.venta.update({
      where: { id },
      data: { fechaUltimoEnvioEmail: new Date() },
    });
    return { enviado: true, previewUrl: resultado.previewUrl, error: null };
  }

  /** Envío automático al crear: nunca lanza; registra el error en Firestore. */
  private async enviarEmailSeguro(id: number): Promise<ResultadoEmail> {
    try {
      return await this.enviarEmail(id);
    } catch (error) {
      await this.errores.registrarBackend(error, {
        ruta: `envio automático email venta #${id}`,
      });
      return {
        enviado: false,
        previewUrl: null,
        error: (error as Error).message,
      };
    }
  }

  private htmlEmail(v: VentaCompleta) {
    const pesos = (valor: Prisma.Decimal | null) =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }).format(Number(valor ?? 0));
    const filas = v.detalles
      .map(
        (d) =>
          `<tr><td>${d.producto.nombre}</td><td align="right">${d.cantidad}</td><td align="right">${pesos(d.subtotal)}</td></tr>`,
      )
      .join('');
    const pago =
      v.modoPago === ModoPago.PLAN
        ? `<p>Pago en ${v.cantidadCuotas} cuotas de <b>${pesos(v.montoCuota)}</b></p>`
        : '<p>Pago al contado</p>';
    return `
      <h2>¡Gracias por tu compra, ${v.cliente.nombre}!</h2>
      <p>Venta N° <b>${v.id}</b></p>
      <table border="1" cellpadding="4" cellspacing="0">
        <tr><th>Producto</th><th>Cantidad</th><th>Subtotal</th></tr>${filas}
      </table>
      <p>Total: <b>${pesos(v.total)}</b></p>${pago}
      <p>Adjuntamos el comprobante en PDF.</p>
      <p>BuySellCycle S.R.L.</p>`;
  }
}
