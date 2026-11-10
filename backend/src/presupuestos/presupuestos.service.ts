import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PdfService } from '../pdf/pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { INCLUDE_PRESUPUESTO } from './presupuestos.include';

const Decimal = Prisma.Decimal;

@Injectable()
export class PresupuestosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
  ) {}

  findAll() {
    return this.prisma.presupuesto.findMany({
      where: { archivado: false },
      include: { cliente: true, usuario: true },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async findOne(id: number) {
    const presupuesto = await this.prisma.presupuesto.findFirst({
      where: { id, archivado: false },
      include: INCLUDE_PRESUPUESTO,
    });
    if (!presupuesto)
      throw new NotFoundException(`El presupuesto ${id} no existe`);
    return presupuesto;
  }

  async create(dto: CreatePresupuestoDto) {
    // 1) Validaciones de negocio
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: dto.clienteId, archivado: false },
    });
    if (!cliente)
      throw new NotFoundException(`El cliente ${dto.clienteId} no existe`);
    if (dto.usuarioId) {
      const usuario = await this.prisma.usuario.findFirst({
        where: { id: dto.usuarioId, archivado: false },
      });
      if (!usuario)
        throw new NotFoundException(`El usuario ${dto.usuarioId} no existe`);
    }
    const vencimiento = new Date(dto.fechaVencimiento);
    if (vencimiento <= new Date())
      throw new BadRequestException('La fecha de vencimiento debe ser futura');

    const ids = dto.items.map((i) => i.productoId);
    if (new Set(ids).size !== ids.length)
      throw new BadRequestException(
        'Hay productos repetidos en el presupuesto',
      );
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: ids }, archivado: false },
    });
    if (productos.length !== ids.length)
      throw new NotFoundException('Alguno de los productos no existe');

    // 2) Cálculos: se "congelan" los precios del momento
    let totalContado = new Decimal(0);
    let totalLista = new Decimal(0);
    const detalles = dto.items.map((item) => {
      const producto = productos.find((p) => p.id === item.productoId)!;
      const subtotalContado = producto.precioContado.mul(item.cantidad);
      const subtotalLista = producto.precioLista.mul(item.cantidad);
      totalContado = totalContado.plus(subtotalContado);
      totalLista = totalLista.plus(subtotalLista);
      return {
        productoId: producto.id,
        cantidad: item.cantidad,
        precioContado: producto.precioContado,
        precioLista: producto.precioLista,
        subtotalContado,
        subtotalLista,
      };
    });

    // 3) Presupuesto + detalles en UNA sola operación (nested create)
    return this.prisma.presupuesto.create({
      data: {
        clienteId: dto.clienteId,
        usuarioId: dto.usuarioId,
        fechaVencimiento: vencimiento,
        observaciones: dto.observaciones,
        totalContado,
        totalLista,
        detalles: { create: detalles },
      },
      include: INCLUDE_PRESUPUESTO,
    });
  }

  async generarPdf(id: number) {
    const presupuesto = await this.findOne(id);
    return this.pdf.generarPdfPresupuesto(presupuesto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.presupuesto.update({
      where: { id },
      data: { archivado: true },
    });
  }
}
