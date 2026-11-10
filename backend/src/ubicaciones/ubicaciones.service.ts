import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UbicacionesService {
  constructor(private readonly prisma: PrismaService) {}

  findProvincias() {
    return this.prisma.provincia.findMany({
      where: { archivado: false },
      orderBy: { nombre: 'asc' },
    });
  }

  async findLocalidades(provinciaId: number) {
    const provincia = await this.prisma.provincia.findFirst({
      where: { id: provinciaId, archivado: false },
    });
    if (!provincia)
      throw new NotFoundException(`La provincia ${provinciaId} no existe`);

    return this.prisma.localidad.findMany({
      where: { provinciaId, archivado: false },
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Regla de negocio reutilizada por Depósito, Sucursal y Cliente:
   * la localidad elegida tiene que pertenecer a la provincia elegida.
   */
  async validarLocalidadDeProvincia(provinciaId: number, localidadId: number) {
    const localidad = await this.prisma.localidad.findFirst({
      where: { id: localidadId, archivado: false },
    });
    if (!localidad)
      throw new BadRequestException(`La localidad ${localidadId} no existe`);
    if (localidad.provinciaId !== provinciaId)
      throw new BadRequestException(
        'La localidad no pertenece a la provincia seleccionada',
      );
  }
}
    