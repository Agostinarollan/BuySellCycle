import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaNivel1Dto } from './dto/create-categoria-nivel1.dto';
import { UpdateCategoriaNivel1Dto } from './dto/update-categoria-nivel1.dto';

@Injectable()
export class CategoriasNivel1Service {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.categoriaNivel1.findMany({
      where: { archivado: false },
      orderBy: { nombre: 'asc' },
    });
  }

  /** Jerarquía: cada categoría nivel 1 con sus categorías nivel 2 hijas. */
  findArbol() {
    return this.prisma.categoriaNivel1.findMany({
      where: { archivado: false },
      orderBy: { nombre: 'asc' },
      include: {
        categoriasNivel2: {
          where: { archivado: false },
          orderBy: { nombre: 'asc' },
        },
      },
    });
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoriaNivel1.findFirst({
      where: { id, archivado: false },
    });
    if (!categoria)
      throw new NotFoundException(`La categoría nivel 1 ${id} no existe`);
    return categoria;
  }

  create(dto: CreateCategoriaNivel1Dto) {
    return this.prisma.categoriaNivel1.create({ data: dto });
  }

  async update(id: number, dto: UpdateCategoriaNivel1Dto) {
    await this.findOne(id);
    return this.prisma.categoriaNivel1.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    const hijas = await this.prisma.categoriaNivel2.count({
      where: { categoriaNivel1Id: id, archivado: false },
    });
    if (hijas > 0)
      throw new BadRequestException(
        'No se puede archivar: tiene categorías nivel 2 activas',
      );
    return this.prisma.categoriaNivel1.update({
      where: { id },
      data: { archivado: true },
    });
  }
}
