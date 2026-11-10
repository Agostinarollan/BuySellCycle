import type { Presupuesto } from '../types';
import { API_URL, http } from './http';

export interface PresupuestoForm {
  clienteId: number;
  usuarioId?: number;
  fechaVencimiento: string; // ISO
  observaciones?: string;
  items: { productoId: number; cantidad: number }[];
}

export const presupuestosApi = {
  listar: async () => (await http.get<Presupuesto[]>('/presupuestos')).data,
  obtener: async (id: number) =>
    (await http.get<Presupuesto>(`/presupuestos/${id}`)).data,
  crear: async (datos: PresupuestoForm) =>
    (await http.post<Presupuesto>('/presupuestos', datos)).data,
  eliminar: async (id: number) =>
    (await http.delete<Presupuesto>(`/presupuestos/${id}`)).data,
  urlPdf: (id: number) => `${API_URL}/presupuestos/${id}/pdf`,
};
