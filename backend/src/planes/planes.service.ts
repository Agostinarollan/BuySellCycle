import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BancosService } from '../bancos/bancos.service';
import { PrismaService } from '../prisma/prisma.service';
import { TarjetasService } from '../tarjetas/tarjetas.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

const INCLUDE_PLAN = { tarjeta: true, banco: true };

@Injectable()
export class PlanesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tarjetas: TarjetasService,
    private readonly bancos: BancosService,
  ) {}

  findAll(tarjetaId?: number, bancoId?: number) {
    return this.prisma.plan.findMany({
      where: { archivado: false, tarjetaId, bancoId },
      include: INCLUDE_PLAN,
      orderBy: [
        { tarjetaId: 'asc' },
        { bancoId: 'asc' },
        { cantidadCuotas: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, archivado: false },
      include: INCLUDE_PLAN,
    });
    if (!plan) throw new NotFoundException(`El plan ${id} no existe`);
    return plan;
  }

  async create(dto: CreatePlanDto) {
    await this.tarjetas.findOne(dto.tarjetaId);
    await this.bancos.findOne(dto.bancoId);
    await this.validarUnicidad(dto.tarjetaId, dto.bancoId, dto.cantidadCuotas);
    return this.prisma.plan.create({ data: dto, include: INCLUDE_PLAN });
  }

  async update(id: number, dto: UpdatePlanDto) {
    const actual = await this.findOne(id);
    const tarjetaId = dto.tarjetaId ?? actual.tarjetaId;
    const bancoId = dto.bancoId ?? actual.bancoId;
    const cuotas = dto.cantidadCuotas ?? actual.cantidadCuotas;
    if (dto.tarjetaId) await this.tarjetas.findOne(dto.tarjetaId);
    if (dto.bancoId) await this.bancos.findOne(dto.bancoId);
    await this.validarUnicidad(tarjetaId, bancoId, cuotas, id);
    return this.prisma.plan.update({
      where: { id },
      data: dto,
      include: INCLUDE_PLAN,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.plan.update({
      where: { id },
      data: { archivado: true },
    });
  }

  /**
   * Regla de la Guía 2: para una misma tarjeta + banco no puede haber dos
   * planes con la misma cantidad de cuotas. (Además hay un @@unique en la BD.)
   */
  private async validarUnicidad(
    tarjetaId: number,
    bancoId: number,
    cantidadCuotas: number,
    idExcluido?: number,
  ) {
    const existente = await this.prisma.plan.findFirst({
      where: { tarjetaId, bancoId, cantidadCuotas, NOT: { id: idExcluido } },
    });
    if (existente)
      throw new ConflictException(
        `Ya existe un plan de ${cantidadCuotas} cuotas para esa tarjeta y banco` +
          (existente.archivado ? ' (está archivado)' : ''),
      );
  }
}
