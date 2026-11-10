import type { RegistroError, TipoSistema } from '../types';
import { http } from './http';

export const erroresApi = {
  listar: async (tipoSistema?: TipoSistema) =>
    (await http.get<RegistroError[]>('/errores', { params: { tipoSistema } }))
      .data,
};
