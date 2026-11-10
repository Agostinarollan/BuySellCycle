import type { Sucursal } from '../types';
import { crearApiCrud } from './crud.api';

export interface SucursalForm {
  nombre: string;
  provinciaId: number;
  localidadId: number;
}

export const sucursalesApi = crearApiCrud<Sucursal, SucursalForm>('/sucursales');
