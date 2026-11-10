import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.proveedor.findMany({
      where: { archivado: false },
      orderBy: { razonSocial: 'asc' },
    });
  }

  async findOne(id: number) {
    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id, archivado: false },
    });
    if (!proveedor) throw new NotFoundException(`El proveedor ${id} no existe`);
    return proveedor;
  }

  create(dto: CreateProveedorDto) {
    return this.prisma.proveedor.create({ data: dto });
  }

  async update(id: number, dto: UpdateProveedorDto) {
    await this.findOne(id);
    return this.prisma.proveedor.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.proveedor.update({
      where: { id },
      data: { archivado: true },
    });
  }
}
