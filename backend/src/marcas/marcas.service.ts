import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@Injectable()
export class MarcasService {
  // Inyección de dependencias: Nest nos "entrega" el PrismaService.
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.marca.findMany({
      where: { archivado: false },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const marca = await this.prisma.marca.findFirst({
      where: { id, archivado: false },
    });
    if (!marca) throw new NotFoundException(`La marca ${id} no existe`);
    return marca;
  }

  create(dto: CreateMarcaDto) {
    return this.prisma.marca.create({ data: dto });
  }

  async update(id: number, dto: UpdateMarcaDto) {
    await this.findOne(id);
    return this.prisma.marca.update({ where: { id }, data: dto });
  }

  // "Eliminar" = archivar (borrado lógico). El registro sigue en la BD.
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.marca.update({
      where: { id },
      data: { archivado: true },
    });
  }
}
