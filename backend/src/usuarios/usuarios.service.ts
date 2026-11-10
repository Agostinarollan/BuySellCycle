import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SucursalesService } from '../sucursales/sucursales.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sucursales: SucursalesService,
  ) {}

  findAll() {
    return this.prisma.usuario.findMany({
      where: { archivado: false },
      include: { sucursal: true },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, archivado: false },
      include: { sucursal: true },
    });
    if (!usuario) throw new NotFoundException(`El usuario ${id} no existe`);
    return usuario;
  }

  async create(dto: CreateUsuarioDto) {
    await this.sucursales.findOne(dto.sucursalId);
    return this.prisma.usuario.create({
      data: dto,
      include: { sucursal: true },
    });
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    if (dto.sucursalId) await this.sucursales.findOne(dto.sucursalId);
    return this.prisma.usuario.update({
      where: { id },
      data: dto,
      include: { sucursal: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { archivado: true },
    });
  }
}
