import type { Deposito } from '../types';
import { crearApiCrud } from './crud.api';

export interface DepositoForm {
  nombre: string;
  provinciaId: number;
  localidadId: number;
}

export const depositosApi = crearApiCrud<Deposito, DepositoForm>('/depositos');
