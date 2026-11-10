import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriasNivel1Service } from '../categorias-nivel1/categorias-nivel1.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaNivel2Dto } from './dto/create-categoria-nivel2.dto';
import { UpdateCategoriaNivel2Dto } from './dto/update-categoria-nivel2.dto';

@Injectable()
export class CategoriasNivel2Service {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriasNivel1: CategoriasNivel1Service,
  ) {}

  findAll(categoriaNivel1Id?: number) {
    return this.prisma.categoriaNivel2.findMany({
      where: { archivado: false, categoriaNivel1Id },
      include: { categoriaNivel1: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoriaNivel2.findFirst({
      where: { id, archivado: false },
      include: { categoriaNivel1: true },
    });
    if (!categoria)
      throw new NotFoundException(`La categoría nivel 2 ${id} no existe`);
    return categoria;
  }

  async create(dto: CreateCategoriaNivel2Dto) {
    await this.categoriasNivel1.findOne(dto.categoriaNivel1Id); // valida padre
    return this.prisma.categoriaNivel2.create({
      data: dto,
      include: { categoriaNivel1: true },
    });
  }

  /** También sirve para "jerarquizar": mover la categoría a otro padre. */
  async update(id: number, dto: UpdateCategoriaNivel2Dto) {
    await this.findOne(id);
    if (dto.categoriaNivel1Id)
      await this.categoriasNivel1.findOne(dto.categoriaNivel1Id);
    return this.prisma.categoriaNivel2.update({
      where: { id },
      data: dto,
      include: { categoriaNivel1: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.categoriaNivel2.update({
      where: { id },
      data: { archivado: true },
    });
  }
}
