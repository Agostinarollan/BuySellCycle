import type {
  EstadoVenta,
  ModoPago,
  ResultadoEmail,
  TipoEntrega,
  Venta,
} from '../types';
import { API_URL, http } from './http';

export interface VentaForm {
  clienteId: number;
  usuarioId: number;
  modoPago: ModoPago;
  planId?: number;
  tipoEntrega: TipoEntrega;
  sucursalId?: number;
  direccionEntrega?: string;
  items: { productoId: number; cantidad: number }[];
}

export const ventasApi = {
  listar: async (estado?: EstadoVenta) =>
    (await http.get<Venta[]>('/ventas', { params: { estado } })).data,
  obtener: async (id: number) => (await http.get<Venta>(`/ventas/${id}`)).data,
  crear: async (datos: VentaForm) =>
    (await http.post<{ venta: Venta; email: ResultadoEmail }>('/ventas', datos))
      .data,
  cambiarEstado: async (
    id: number,
    estado: EstadoVenta,
    motivoCancelacion?: string,
  ) =>
    (
      await http.patch<Venta>(`/ventas/${id}/estado`, {
        estado,
        motivoCancelacion,
      })
    ).data,
  enviarEmail: async (id: number) =>
    (await http.post<ResultadoEmail>(`/ventas/${id}/enviar-email`)).data,
  urlPdf: (id: number) => `${API_URL}/ventas/${id}/pdf`,
};
