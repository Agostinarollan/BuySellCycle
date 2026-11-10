import type { RolUsuario, Usuario } from '../types';
import { crearApiCrud } from './crud.api';

export interface UsuarioForm {
  nombre: string;
  apellido: string;
  dni: string;
  nombreUsuario: string;
  rol: RolUsuario;
  sucursalId: number;
}

export const usuariosApi = crearApiCrud<Usuario, UsuarioForm>('/usuarios');
