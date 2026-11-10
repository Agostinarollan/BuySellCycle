import { Prisma } from '@prisma/client';

export const INCLUDE_VENTA = {
  cliente: { include: { provincia: true, localidad: true } },
  usuario: true,
  plan: { include: { tarjeta: true, banco: true } },
  sucursal: { include: { provincia: true, localidad: true } },
  detalles: { include: { producto: true } },
} satisfies Prisma.VentaInclude;

export type VentaCompleta = Prisma.VentaGetPayload<{
  include: typeof INCLUDE_VENTA;
}>;
