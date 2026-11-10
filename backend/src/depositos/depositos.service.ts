import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UbicacionesService } from '../ubicaciones/ubicaciones.service';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { UpdateDepositoDto } from './dto/update-deposito.dto';

const INCLUDE_UBICACION = { provincia: true, localidad: true };

@Injectable()
export class DepositosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ubicaciones: UbicacionesService,
  ) {}

  findAll() {
    return this.prisma.deposito.findMany({
      where: { archivado: false },
      include: INCLUDE_UBICACION,
      orderBy: { codigo: 'asc' },
    });
  }

  async findOne(id: number) {
    const deposito = await this.prisma.deposito.findFirst({
      where: { id, archivado: false },
      include: INCLUDE_UBICACION,
    });
    if (!deposito) throw new NotFoundException(`El depósito ${id} no existe`);
    return deposito;
  }

  async create(dto: CreateDepositoDto) {
    await this.ubicaciones.validarLocalidadDeProvincia(
      dto.provinciaId,
      dto.localidadId,
    );
    const codigo = await this.generarCodigo();
    return this.prisma.deposito.create({
      data: { ...dto, codigo },
      include: INCLUDE_UBICACION,
    });
  }

  async update(id: number, dto: UpdateDepositoDto) {
    const actual = await this.findOne(id);
    await this.ubicaciones.validarLocalidadDeProvincia(
      dto.provinciaId ?? actual.provinciaId,
      dto.localidadId ?? actual.localidadId,
    );
    return this.prisma.deposito.update({
      where: { id },
      data: dto,
      include: INCLUDE_UBICACION,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const conStock = await this.prisma.stockProductoDeposito.count({
      where: { depositoId: id, stock: { gt: 0 } },
    });
    if (conStock > 0)
      throw new BadRequestException(
        'No se puede archivar un depósito que todavía tiene stock',
      );
    return this.prisma.deposito.update({
      where: { id },
      data: { archivado: true },
    });
  }

  /** Genera DEP-01, DEP-02, ... tomando el último código usado. */
  private async generarCodigo(): Promise<string> {
    const ultimo = await this.prisma.deposito.findFirst({
      orderBy: { id: 'desc' },
    });
    const siguiente = ultimo
      ? parseInt(ultimo.codigo.replace('DEP-', ''), 10) + 1
      : 1;
    return `DEP-${String(siguiente).padStart(2, '0')}`;
  }
}
