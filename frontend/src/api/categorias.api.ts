import type { CategoriaNivel1, CategoriaNivel2 } from '../types';
import { crearApiCrud } from './crud.api';
import { http } from './http';

export interface CategoriaNivel1Form {
  nombre: string;
}
export interface CategoriaNivel2Form {
  nombre: string;
  categoriaNivel1Id: number;
}

export const categoriasNivel1Api = {
  ...crearApiCrud<CategoriaNivel1, CategoriaNivel1Form>('/categorias-nivel1'),
  arbol: async () =>
    (await http.get<CategoriaNivel1[]>('/categorias-nivel1/arbol')).data,
};

export const categoriasNivel2Api = {
  ...crearApiCrud<CategoriaNivel2, CategoriaNivel2Form>('/categorias-nivel2'),
  porNivel1: async (categoriaNivel1Id: number) =>
    (
      await http.get<CategoriaNivel2[]>('/categorias-nivel2', {
        params: { categoriaNivel1Id },
      })
    ).data,
};
