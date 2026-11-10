import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UbicacionesService } from '../ubicaciones/ubicaciones.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

const INCLUDE_UBICACION = { provincia: true, localidad: true };

@Injectable()
export class SucursalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ubicaciones: UbicacionesService,
  ) {}

  findAll() {
    return this.prisma.sucursal.findMany({
      where: { archivado: false },
      include: INCLUDE_UBICACION,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const sucursal = await this.prisma.sucursal.findFirst({
      where: { id, archivado: false },
      include: INCLUDE_UBICACION,
    });
    if (!sucursal) throw new NotFoundException(`La sucursal ${id} no existe`);
    return sucursal;
  }

  async create(dto: CreateSucursalDto) {
    await this.ubicaciones.validarLocalidadDeProvincia(
      dto.provinciaId,
      dto.localidadId,
    );
    return this.prisma.sucursal.create({
      data: dto,
      include: INCLUDE_UBICACION,
    });
  }

  async update(id: number, dto: UpdateSucursalDto) {
    const actual = await this.findOne(id);
    await this.ubicaciones.validarLocalidadDeProvincia(
      dto.provinciaId ?? actual.provinciaId,
      dto.localidadId ?? actual.localidadId,
    );
    return this.prisma.sucursal.update({
      where: { id },
      data: dto,
      include: INCLUDE_UBICACION,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.sucursal.update({
      where: { id },
      data: { archivado: true },
    });
  }
}
