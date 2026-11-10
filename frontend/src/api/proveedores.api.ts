import type { Proveedor } from '../types';
import { crearApiCrud } from './crud.api';

export interface ProveedorForm {
  razonSocial: string;
  cuit: string;
}

export const proveedoresApi = crearApiCrud<Proveedor, ProveedorForm>(
  '/proveedores',
);
