import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';

@Injectable()
export class BancosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.banco.findMany({
      where: { archivado: false },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const banco = await this.prisma.banco.findFirst({
      where: { id, archivado: false },
    });
    if (!banco) throw new NotFoundException(`El banco ${id} no existe`);
    return banco;
  }

  create(dto: CreateBancoDto) {
    return this.prisma.banco.create({ data: dto });
  }

  async update(id: number, dto: UpdateBancoDto) {
    await this.findOne(id);
    return this.prisma.banco.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.banco.update({
      where: { id },
      data: { archivado: true },
    });
  }
}
