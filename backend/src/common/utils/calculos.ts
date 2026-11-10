import { EstadoProducto, Prisma } from '@prisma/client';

// Prisma.Decimal es la clase de decimal.js que trae Prisma.
// Nunca usamos number para dinero: 0.1 + 0.2 = 0.30000000000000004
const Decimal = Prisma.Decimal;
type ValorNumerico = Prisma.Decimal | number | string;

/** Precio de lista = costo neto + utilidad %  */
export function calcularPrecioLista(
  costoNeto: ValorNumerico,
  utilidad: ValorNumerico,
): Prisma.Decimal {
  return new Decimal(costoNeto)
    .mul(new Decimal(100).plus(utilidad))
    .div(100)
    .toDecimalPlaces(2);
}

/** Precio contado = precio de lista - % descuento pago contado */
export function calcularPrecioContado(
  precioLista: ValorNumerico,
  descuentoContado: ValorNumerico,
): Prisma.Decimal {
  return new Decimal(precioLista)
    .mul(new Decimal(100).minus(descuentoContado))
    .div(100)
    .toDecimalPlaces(2);
}

/** Financiación: total = monto + tasa %, cuota = total / cantidad de cuotas */
export function calcularFinanciacion(
  monto: ValorNumerico,
  tasaFinanciacion: ValorNumerico,
  cantidadCuotas: number,
): { total: Prisma.Decimal; montoCuota: Prisma.Decimal } {
  const total = new Decimal(monto)
    .mul(new Decimal(100).plus(tasaFinanciacion))
    .div(100)
    .toDecimalPlaces(2);
  const montoCuota = total.div(cantidadCuotas).toDecimalPlaces(2);
  return { total, montoCuota };
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Regla de la consigna:
 *  - stock 0 y 15 días o más sin movimientos -> INACTIVO
 *  - stock 0 y 7 días o más sin movimientos  -> ACTIVO
 *  - en cualquier otro caso                  -> DISPONIBLE
 */
export function calcularEstadoProducto(
  stockTotal: number,
  fechaUltimoMovimiento: Date,
  ahora: Date = new Date(),
): EstadoProducto {
  if (stockTotal > 0) return EstadoProducto.DISPONIBLE;
  const dias = Math.floor(
    (ahora.getTime() - fechaUltimoMovimiento.getTime()) / MS_POR_DIA,
  );
  if (dias >= 15) return EstadoProducto.INACTIVO;
  if (dias >= 7) return EstadoProducto.ACTIVO;
  return EstadoProducto.DISPONIBLE;
}
