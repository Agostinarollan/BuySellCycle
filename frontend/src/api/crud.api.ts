import { http } from './http';

/**
 * Fábrica genérica: a partir del nombre del recurso ("/marcas") arma las
 * 5 funciones del ABM. <T> = tipo que devuelve el backend, <D> = datos del form.
 */
export function crearApiCrud<T, D>(recurso: string) {
  return {
    listar: async (): Promise<T[]> => (await http.get<T[]>(recurso)).data,
    obtener: async (id: number): Promise<T> =>
      (await http.get<T>(`${recurso}/${id}`)).data,
    crear: async (datos: D): Promise<T> =>
      (await http.post<T>(recurso, datos)).data,
    actualizar: async (id: number, datos: Partial<D>): Promise<T> =>
      (await http.patch<T>(`${recurso}/${id}`, datos)).data,
    eliminar: async (id: number): Promise<T> =>
      (await http.delete<T>(`${recurso}/${id}`)).data,
  };
}

export type ApiCrud<T, D> = ReturnType<typeof crearApiCrud<T, D>>;
