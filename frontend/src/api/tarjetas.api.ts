import type { Tarjeta, TipoTarjeta } from '../types';
import { crearApiCrud } from './crud.api';
import { API_URL, http } from './http';

export interface TarjetaForm {
  nombre: string;
  tipo: TipoTarjeta;
}

export const tarjetasApi = {
  ...crearApiCrud<Tarjeta, TarjetaForm>('/tarjetas'),
  subirImagen: async (id: number, archivo: File) => {
    const formData = new FormData();
    formData.append('imagen', archivo);
    return (await http.post<Tarjeta>(`/tarjetas/${id}/imagen`, formData)).data;
  },
  urlImagen: (tarjeta: Tarjeta) =>
    `${API_URL}/tarjetas/${tarjeta.id}/imagen?v=${encodeURIComponent(
      tarjeta.rutaImagen ?? '',
    )}`,
};
