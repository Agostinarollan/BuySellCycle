import { Prisma } from '@prisma/client';

// "include" reutilizable: qué relaciones traer junto con el presupuesto.
export const INCLUDE_PRESUPUESTO = {
  cliente: { include: { provincia: true, localidad: true } },
  usuario: true,
  detalles: { include: { producto: true } },
} satisfies Prisma.PresupuestoInclude;

export type PresupuestoCompleto = Prisma.PresupuestoGetPayload<{
  include: typeof INCLUDE_PRESUPUESTO;
}>;
