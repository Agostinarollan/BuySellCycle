import Decimal from 'decimal.js';

// MISMAS fórmulas que el backend (backend/src/common/utils/calculos.ts).
// En el frontend solo se usan para MOSTRAR una vista previa mientras
// el usuario escribe; el valor que se guarda lo calcula el backend.

type Num = Decimal.Value | null | undefined;
const d = (valor: Num) => new Decimal(valor ?? 0);

export function calcularPrecioLista(costoNeto: Num, utilidad: Num): Decimal {
  return d(costoNeto).mul(d(100).plus(d(utilidad))).div(100).toDecimalPlaces(2);
}

export function calcularPrecioContado(precioLista: Num, descuento: Num): Decimal {
  return d(precioLista).mul(d(100).minus(d(descuento))).div(100).toDecimalPlaces(2);
}

export function calcularFinanciacion(monto: Num, tasa: Num, cuotas: number) {
  const total = d(monto).mul(d(100).plus(d(tasa))).div(100).toDecimalPlaces(2);
  const montoCuota = cuotas > 0 ? total.div(cuotas).toDecimalPlaces(2) : d(0);
  return { total, montoCuota };
}
