import { create } from 'zustand';
import type { RolUsuario } from '../types';

/**
 * Usuario que está usando el sistema.
 * El backend no tiene autenticación (decisión AMB09 del manual: la entidad
 * Usuario no tiene contraseña), así que "iniciar sesión" es elegir con qué
 * usuario se trabaja. Se guarda en localStorage para sobrevivir a recargas.
 */
export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  sucursal: string | null;
}

interface SesionState {
  usuario: UsuarioSesion | null;
  iniciar: (usuario: UsuarioSesion) => void;
  cerrar: () => void;
}

const CLAVE = 'buysellcycle.sesion';

function leerGuardado(): UsuarioSesion | null {
  try {
    const texto = localStorage.getItem(CLAVE);
    return texto ? (JSON.parse(texto) as UsuarioSesion) : null;
  } catch {
    return null;
  }
}

export const useSesionStore = create<SesionState>((set) => ({
  usuario: leerGuardado(),

  iniciar: (usuario) => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(usuario));
    } catch {
      // sin localStorage la sesión dura hasta recargar
    }
    set({ usuario });
  },

  cerrar: () => {
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      // nada que limpiar
    }
    set({ usuario: null });
  },
}));
