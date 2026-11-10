import type { Plan } from '../types';
import { crearApiCrud } from './crud.api';
import { http } from './http';

export interface PlanForm {
  tarjetaId: number;
  bancoId: number;
  cantidadCuotas: number;
  tasaFinanciacion: number;
  observaciones?: string;
}

export const planesApi = {
  ...crearApiCrud<Plan, PlanForm>('/planes'),
  filtrar: async (tarjetaId: number, bancoId: number) =>
    (await http.get<Plan[]>('/planes', { params: { tarjetaId, bancoId } })).data,
};
