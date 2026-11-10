import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  calcularPrecioContado,
  calcularPrecioLista,
} from '../common/utils/calculos';
import { ImagenesService } from '../firebase/imagenes.service';
import { PrismaService } from '../prisma/prisma.service';
import { sincronizarStockProducto } from '../stock/stock.utils';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

const INCLUDE_PRODUCTO = {
  marca: true,
  categoriaNivel2: { include: { categoriaNivel1: true } },
};

@Injectable()
export class ProductosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imagenes: ImagenesService,
  ) {}

  findAll() {
    return this.prisma.producto.findMany({
      where: { archivado: false },
      include: INCLUDE_PRODUCTO,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findFirst({
      where: { id, archivado: false },
      include: {
        ...INCLUDE_PRODUCTO,
        stocks: { where: { archivado: false }, include: { deposito: true } },
      },
    });
    if (!producto) throw new NotFoundException(`El producto ${id} no existe`);
    return producto;
  }

  async create(dto: CreateProductoDto) {
    await this.validarRelaciones(dto.marcaId, dto.categoriaNivel2Id);
    const precioLista = calcularPrecioLista(dto.costoNeto, dto.utilidad);
    const precioContado = calcularPrecioContado(
      precioLista,
      dto.descuentoContado,
    );
    return this.prisma.producto.create({
      data: { ...dto, precioLista, precioContado },
      include: INCLUDE_PRODUCTO,
    });
  }

  async update(id: number, dto: UpdateProductoDto) {
    const actual = await this.findOne(id);
    await this.validarRelaciones(dto.marcaId, dto.categoriaNivel2Id);

    // Si cambia cualquiera de los datos de entrada, se recalculan los precios.
    const costoNeto = dto.costoNeto ?? actual.costoNeto;
    const utilidad = dto.utilidad ?? actual.utilidad;
    const descuento = dto.descuentoContado ?? actual.descuentoContado;
    const precioLista = calcularPrecioLista(costoNeto, utilidad);
    const precioContado = calcularPrecioContado(precioLista, descuento);

    return this.prisma.producto.update({
      where: { id },
      data: { ...dto, precioLista, precioContado },
      include: INCLUDE_PRODUCTO,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.producto.update({
      where: { id },
      data: { archivado: true },
    });
  }

  // ------------------------- IMÁGENES -------------------------

  async subirImagen(id: number, archivo: Express.Multer.File | undefined) {
    const producto = await this.findOne(id);
    const ruta = await this.imagenes.subir('productos', id, archivo);
    await this.imagenes.eliminar(producto.rutaImagen); // borra la anterior
    return this.prisma.producto.update({
      where: { id },
      data: { rutaImagen: ruta },
      include: INCLUDE_PRODUCTO,
    });
  }

  async obtenerImagen(id: number) {
    const producto = await this.findOne(id);
    return this.imagenes.descargar(producto.rutaImagen);
  }

  // ------------------------- PROCESOS -------------------------

  /**
   * Proceso pedido por la consigna: recorre el stock de cada depósito,
   * acumula el stock de cada producto, lo guarda en stockTotal y,
   * con ese dato, recalcula el Estado (DISPONIBLE / ACTIVO / INACTIVO).
   */
  async sincronizarStockYEstados() {
    const productos = await this.prisma.producto.findMany({
      where: { archivado: false },
      select: { id: true },
    });
    const ahora = new Date();
    for (const { id } of productos) {
      await this.prisma.$transaction((tx: Prisma.TransactionClient) =>
        sincronizarStockProducto(tx, id, ahora),
      );
    }
    return {
      productosProcesados: productos.length,
      fecha: ahora.toISOString(),
    };
  }

  private async validarRelaciones(
    marcaId?: number,
    categoriaNivel2Id?: number,
  ) {
    if (marcaId) {
      const marca = await this.prisma.marca.findFirst({
        where: { id: marcaId, archivado: false },
      });
      if (!marca) throw new NotFoundException(`La marca ${marcaId} no existe`);
    }
    if (categoriaNivel2Id) {
      const categoria = await this.prisma.categoriaNivel2.findFirst({
        where: { id: categoriaNivel2Id, archivado: false },
      });
      if (!categoria)
        throw new NotFoundException(
          `La categoría nivel 2 ${categoriaNivel2Id} no existe`,
        );
    }
  }
}
