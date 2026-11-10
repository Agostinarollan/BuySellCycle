import type { DireccionEntrega } from '../types';
import { http } from './http';

export interface DireccionForm {
  direccion: string;
  esPrincipal?: boolean;
}

export const direccionesApi = {
  porCliente: async (clienteId: number) =>
    (await http.get<DireccionEntrega[]>(`/clientes/${clienteId}/direcciones`))
      .data,
  crear: async (clienteId: number, datos: DireccionForm) =>
    (
      await http.post<DireccionEntrega>(
        `/clientes/${clienteId}/direcciones`,
        datos,
      )
    ).data,
  actualizar: async (id: number, datos: Partial<DireccionForm>) =>
    (await http.patch<DireccionEntrega>(`/direcciones/${id}`, datos)).data,
  marcarPrincipal: async (id: number) =>
    (await http.patch<DireccionEntrega>(`/direcciones/${id}/principal`)).data,
  eliminar: async (id: number) =>
    (await http.delete<DireccionEntrega>(`/direcciones/${id}`)).data,
};
