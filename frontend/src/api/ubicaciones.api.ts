import type { Localidad, Provincia } from '../types';
import { http } from './http';

export const ubicacionesApi = {
  provincias: async () => (await http.get<Provincia[]>('/provincias')).data,
  localidades: async (provinciaId: number) =>
    (await http.get<Localidad[]>(`/provincias/${provinciaId}/localidades`)).data,
};
