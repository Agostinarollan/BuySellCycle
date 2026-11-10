import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UbicacionesService } from '../ubicaciones/ubicaciones.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

const INCLUDE_CLIENTE = {
  provincia: true,
  localidad: true,
  direcciones: { where: { archivado: false } },
};

@Injectable()
export class ClientesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ubicaciones: UbicacionesService,
  ) {}

  findAll() {
    return this.prisma.cliente.findMany({
      where: { archivado: false },
      include: INCLUDE_CLIENTE,
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, archivado: false },
      include: INCLUDE_CLIENTE,
    });
    if (!cliente) throw new NotFoundException(`El cliente ${id} no existe`);
    return cliente;
  }

  async create(dto: CreateClienteDto) {
    await this.ubicaciones.validarLocalidadDeProvincia(
      dto.provinciaId,
      dto.localidadId,
    );
    return this.prisma.cliente.create({ data: dto, include: INCLUDE_CLIENTE });
  }

  async update(id: number, dto: UpdateClienteDto) {
    const actual = await this.findOne(id);
    await this.ubicaciones.validarLocalidadDeProvincia(
      dto.provinciaId ?? actual.provinciaId,
      dto.localidadId ?? actual.localidadId,
    );
    return this.prisma.cliente.update({
      where: { id },
      data: dto,
      include: INCLUDE_CLIENTE,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cliente.update({
      where: { id },
      data: { archivado: true },
    });
  }
}
