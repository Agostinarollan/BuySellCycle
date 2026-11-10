import { Injectable, NotFoundException } from '@nestjs/common';
import { ImagenesService } from '../firebase/imagenes.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto';

@Injectable()
export class TarjetasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imagenes: ImagenesService,
  ) {}

  findAll() {
    return this.prisma.tarjeta.findMany({
      where: { archivado: false },
      orderBy: [{ nombre: 'asc' }, { tipo: 'asc' }],
    });
  }

  async findOne(id: number) {
    const tarjeta = await this.prisma.tarjeta.findFirst({
      where: { id, archivado: false },
    });
    if (!tarjeta) throw new NotFoundException(`La tarjeta ${id} no existe`);
    return tarjeta;
  }

  create(dto: CreateTarjetaDto) {
    return this.prisma.tarjeta.create({ data: dto });
  }

  async update(id: number, dto: UpdateTarjetaDto) {
    await this.findOne(id);
    return this.prisma.tarjeta.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tarjeta.update({
      where: { id },
      data: { archivado: true },
    });
  }

  async subirImagen(id: number, archivo: Express.Multer.File | undefined) {
    const tarjeta = await this.findOne(id);
    const ruta = await this.imagenes.subir('tarjetas', id, archivo);
    await this.imagenes.eliminar(tarjeta.rutaImagen);
    return this.prisma.tarjeta.update({
      where: { id },
      data: { rutaImagen: ruta },
    });
  }

  async obtenerImagen(id: number) {
    const tarjeta = await this.findOne(id);
    return this.imagenes.descargar(tarjeta.rutaImagen);
  }
}
