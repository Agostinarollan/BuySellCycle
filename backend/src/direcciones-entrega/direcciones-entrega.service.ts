import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientesService } from '../clientes/clientes.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDireccionEntregaDto } from './dto/create-direccion-entrega.dto';
import { UpdateDireccionEntregaDto } from './dto/update-direccion-entrega.dto';

@Injectable()
export class DireccionesEntregaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clientes: ClientesService,
  ) {}

  async findByCliente(clienteId: number) {
    await this.clientes.findOne(clienteId);
    return this.prisma.direccionEntrega.findMany({
      where: { clienteId, archivado: false },
      orderBy: [{ esPrincipal: 'desc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    const direccion = await this.prisma.direccionEntrega.findFirst({
      where: { id, archivado: false },
    });
    if (!direccion) throw new NotFoundException(`La dirección ${id} no existe`);
    return direccion;
  }

  /**
   * Regla: un cliente puede tener varias direcciones pero SOLO UNA principal.
   * - La primera dirección del cliente es principal automáticamente.
   * - Si la nueva se marca principal, las demás dejan de serlo (misma transacción).
   */
  async create(clienteId: number, dto: CreateDireccionEntregaDto) {
    await this.clientes.findOne(clienteId);
    const cantidad = await this.prisma.direccionEntrega.count({
      where: { clienteId, archivado: false },
    });
    const esPrincipal = cantidad === 0 ? true : (dto.esPrincipal ?? false);

    return this.prisma.$transaction(async (tx) => {
      if (esPrincipal) {
        await tx.direccionEntrega.updateMany({
          where: { clienteId },
          data: { esPrincipal: false },
        });
      }
      return tx.direccionEntrega.create({
        data: { clienteId, direccion: dto.direccion, esPrincipal },
      });
    });
  }

  async update(id: number, dto: UpdateDireccionEntregaDto) {
    await this.findOne(id);
    if (dto.esPrincipal) return this.marcarPrincipal(id, dto.direccion);
    return this.prisma.direccionEntrega.update({
      where: { id },
      data: { direccion: dto.direccion },
    });
  }

  async marcarPrincipal(id: number, nuevaDireccion?: string) {
    const direccion = await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      await tx.direccionEntrega.updateMany({
        where: { clienteId: direccion.clienteId },
        data: { esPrincipal: false },
      });
      return tx.direccionEntrega.update({
        where: { id },
        data: { esPrincipal: true, direccion: nuevaDireccion },
      });
    });
  }

  /** Si se archiva la principal, la más antigua que quede pasa a ser principal. */
  async remove(id: number) {
    const direccion = await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const archivada = await tx.direccionEntrega.update({
        where: { id },
        data: { archivado: true, esPrincipal: false },
      });
      if (direccion.esPrincipal) {
        const otra = await tx.direccionEntrega.findFirst({
          where: { clienteId: direccion.clienteId, archivado: false },
          orderBy: { id: 'asc' },
        });
        if (otra)
          await tx.direccionEntrega.update({
            where: { id: otra.id },
            data: { esPrincipal: true },
          });
      }
      return archivada;
    });
  }
}
