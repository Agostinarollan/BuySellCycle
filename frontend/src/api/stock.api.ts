import type { MovimientoStock, StockProductoDeposito } from '../types';
import { http } from './http';

export interface IngresoForm {
  productoId: number;
  depositoId: number;
  cantidad: number;
  proveedorId?: number;
  observacion?: string;
}
export interface EgresoForm {
  productoId: number;
  depositoId: number;
  cantidad: number;
  observacion?: string;
}
export interface TransferenciaForm {
  productoId: number;
  depositoOrigenId: number;
  depositoDestinoId: number;
  cantidad: number;
  observacion?: string;
}

export const stockApi = {
  porProducto: async (productoId: number) =>
    (await http.get<StockProductoDeposito[]>(`/stock/productos/${productoId}`))
      .data,
  movimientos: async (productoId?: number) =>
    (
      await http.get<MovimientoStock[]>('/stock/movimientos', {
        params: { productoId },
      })
    ).data,
  ingreso: async (datos: IngresoForm) =>
    (await http.post<MovimientoStock>('/stock/ingreso', datos)).data,
  egreso: async (datos: EgresoForm) =>
    (await http.post<MovimientoStock>('/stock/egreso', datos)).data,
  transferencia: async (datos: TransferenciaForm) =>
    (await http.post<MovimientoStock>('/stock/transferencia', datos)).data,
};
