import type { Banco } from '../types';
import { crearApiCrud } from './crud.api';

export interface BancoForm {
  nombre: string;
}

export const bancosApi = crearApiCrud<Banco, BancoForm>('/bancos');
