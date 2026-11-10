import { Injectable } from '@nestjs/common';
import { calcularFinanciacion } from '../common/utils/calculos';
import { PlanesService } from '../planes/planes.service';
import { PrismaService } from '../prisma/prisma.service';
import { SimularFinanciacionDto } from './dto/simular-financiacion.dto';

@Injectable()
export class FinanciacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planes: PlanesService,
  ) {}

  /** Paso 2 del selector: bancos que tienen planes para la tarjeta elegida. */
  bancosPorTarjeta(tarjetaId: number) {
    return this.prisma.banco.findMany({
      where: {
        archivado: false,
        planes: { some: { tarjetaId, archivado: false } },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  /** Simulador: sin guardar nada, calcula total financiado y cuota. */
  async simular(dto: SimularFinanciacionDto) {
    const plan = await this.planes.findOne(dto.planId);
    const { total, montoCuota } = calcularFinanciacion(
      dto.monto,
      plan.tasaFinanciacion,
      plan.cantidadCuotas,
    );
    return {
      monto: dto.monto.toFixed(2),
      tarjeta: plan.tarjeta.nombre,
      banco: plan.banco.nombre,
      cantidadCuotas: plan.cantidadCuotas,
      tasaFinanciacion: plan.tasaFinanciacion,
      total,
      montoCuota,
    };
  }
}
