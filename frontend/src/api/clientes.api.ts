import type { Cliente } from '../types';
import { crearApiCrud } from './crud.api';

export interface ClienteForm {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  provinciaId: number;
  localidadId: number;
}

export const clientesApi = crearApiCrud<Cliente, ClienteForm>('/clientes');
