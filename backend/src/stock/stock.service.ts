import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoMovimientoStock } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EgresoStockDto } from './dto/egreso-stock.dto';
import { IngresoStockDto } from './dto/ingreso-stock.dto';
import { TransferenciaStockDto } from './dto/transferencia-stock.dto';
import {
  marcarMovimiento,
  restarStock,
  sincronizarStockProducto,
  sumarStock,
} from './stock.utils';

const INCLUDE_MOVIMIENTO = {
  producto: { select: { id: true, nombre: true } },
  depositoOrigen: { select: { id: true, codigo: true, nombre: true } },
  depositoDestino: { select: { id: true, codigo: true, nombre: true } },
  proveedor: { select: { id: true, razonSocial: true } },
};

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  /** Stock de un producto, depósito por depósito. */
  async stockPorProducto(productoId: number) {
    await this.validarProducto(this.prisma, productoId);
    return this.prisma.stockProductoDeposito.findMany({
      where: { productoId, archivado: false },
      include: { deposito: true },
      orderBy: { deposito: { codigo: 'asc' } },
    });
  }

  listarMovimientos(productoId?: number) {
    return this.prisma.movimientoStock.findMany({
      where: { archivado: false, productoId },
      include: INCLUDE_MOVIMIENTO,
      orderBy: { fechaCreacion: 'desc' },
      take: 200,
    });
  }

  ingreso(dto: IngresoStockDto) {
    // $transaction: TODO lo de adentro se confirma junto o se deshace junto.
    return this.prisma.$transaction(async (tx) => {
      await this.validarProducto(tx, dto.productoId);
      await this.validarDeposito(tx, dto.depositoId);
      if (dto.proveedorId) await this.validarProveedor(tx, dto.proveedorId);

      await sumarStock(tx, dto.productoId, dto.depositoId, dto.cantidad);
      const movimiento = await tx.movimientoStock.create({
        data: {
          tipo: TipoMovimientoStock.INGRESO,
          cantidad: dto.cantidad,
          productoId: dto.productoId,
          depositoDestinoId: dto.depositoId,
          proveedorId: dto.proveedorId,
          observacion: dto.observacion,
        },
        include: INCLUDE_MOVIMIENTO,
      });
      await marcarMovimiento(tx, dto.productoId);
      await sincronizarStockProducto(tx, dto.productoId);
      return movimiento;
    });
  }

  egreso(dto: EgresoStockDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.validarProducto(tx, dto.productoId);
      await this.validarDeposito(tx, dto.depositoId);

      await restarStock(tx, dto.productoId, dto.depositoId, dto.cantidad);
      const movimiento = await tx.movimientoStock.create({
        data: {
          tipo: TipoMovimientoStock.EGRESO,
          cantidad: dto.cantidad,
          productoId: dto.productoId,
          depositoOrigenId: dto.depositoId,
          observacion: dto.observacion,
        },
        include: INCLUDE_MOVIMIENTO,
      });
      await marcarMovimiento(tx, dto.productoId);
      await sincronizarStockProducto(tx, dto.productoId);
      return movimiento;
    });
  }

  /**
   * Transferencia = restar en el depósito A + sumar en el depósito B.
   * Si falla cualquiera de los dos pasos, la transacción deshace ambos.
   */
  transferencia(dto: TransferenciaStockDto) {
    if (dto.depositoOrigenId === dto.depositoDestinoId)
      throw new BadRequestException(
        'El depósito de origen y el de destino deben ser distintos',
      );

    return this.prisma.$transaction(async (tx) => {
      await this.validarProducto(tx, dto.productoId);
      await this.validarDeposito(tx, dto.depositoOrigenId);
      await this.validarDeposito(tx, dto.depositoDestinoId);

      await restarStock(tx, dto.productoId, dto.depositoOrigenId, dto.cantidad);
      await sumarStock(tx, dto.productoId, dto.depositoDestinoId, dto.cantidad);

      const movimiento = await tx.movimientoStock.create({
        data: {
          tipo: TipoMovimientoStock.TRANSFERENCIA,
          cantidad: dto.cantidad,
          productoId: dto.productoId,
          depositoOrigenId: dto.depositoOrigenId,
          depositoDestinoId: dto.depositoDestinoId,
          observacion: dto.observacion,
        },
        include: INCLUDE_MOVIMIENTO,
      });
      await marcarMovimiento(tx, dto.productoId);
      await sincronizarStockProducto(tx, dto.productoId);
      return movimiento;
    });
  }

  // ----------------------- validaciones -----------------------

  private async validarProducto(tx: Prisma.TransactionClient, id: number) {
    const producto = await tx.producto.findFirst({
      where: { id, archivado: false },
    });
    if (!producto) throw new NotFoundException(`El producto ${id} no existe`);
  }

  private async validarDeposito(tx: Prisma.TransactionClient, id: number) {
    const deposito = await tx.deposito.findFirst({
      where: { id, archivado: false },
    });
    if (!deposito) throw new NotFoundException(`El depósito ${id} no existe`);
  }

  private async validarProveedor(tx: Prisma.TransactionClient, id: number) {
    const proveedor = await tx.proveedor.findFirst({
      where: { id, archivado: false },
    });
    if (!proveedor) throw new NotFoundException(`El proveedor ${id} no existe`);
  }
}
