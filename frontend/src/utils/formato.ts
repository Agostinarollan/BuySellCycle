import dayjs from 'dayjs';
import Decimal from 'decimal.js';
import type { EstadoProducto, EstadoVenta } from '../types';

const formatoPesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

/** "1500.5" -> "$ 1.500,50" */
export function formatearMoneda(
  valor: string | number | Decimal | null | undefined,
): string {
  if (valor === null || valor === undefined || valor === '') return '-';
  return formatoPesos.format(new Decimal(valor).toNumber());
}

/** ISO -> "28/09/2026 14:30" (dayjs) */
export function formatearFecha(iso: string | null | undefined): string {
  return iso ? dayjs(iso).format('DD/MM/YYYY HH:mm') : '-';
}

export function formatearSoloFecha(iso: string | null | undefined): string {
  return iso ? dayjs(iso).format('DD/MM/YYYY') : '-';
}

/** "hace 3 días" (plugin relativeTime de dayjs, configurado en main.tsx) */
export function haceCuanto(iso: string | null | undefined): string {
  return iso ? dayjs(iso).fromNow() : 'sin movimientos';
}

export const ETIQUETA_ESTADO_VENTA: Record<EstadoVenta, string> = {
  EN_PREPARACION: 'En preparación',
  DISPONIBLE_PARA_RETIRAR: 'Disponible para retirar',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export const COLOR_ESTADO_VENTA: Record<EstadoVenta, string> = {
  EN_PREPARACION: 'gold',
  DISPONIBLE_PARA_RETIRAR: 'blue',
  EN_CAMINO: 'geekblue',
  ENTREGADO: 'green',
  CANCELADO: 'red',
};

export const COLOR_ESTADO_PRODUCTO: Record<EstadoProducto, string> = {
  DISPONIBLE: 'green',
  ACTIVO: 'blue',
  INACTIVO: 'default', // gris
};
