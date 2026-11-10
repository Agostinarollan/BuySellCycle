import type { Marca } from '../types';
import { crearApiCrud } from './crud.api';

export interface MarcaForm {
  nombre: string;
}

export const marcasApi = crearApiCrud<Marca, MarcaForm>('/marcas');
