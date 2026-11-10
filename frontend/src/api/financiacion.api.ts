import type { Banco, Simulacion } from '../types';
import { http } from './http';

export const financiacionApi = {
  bancosPorTarjeta: async (tarjetaId: number) =>
    (await http.get<Banco[]>('/financiacion/bancos', { params: { tarjetaId } }))
      .data,
  simular: async (monto: number, planId: number) =>
    (await http.post<Simulacion>('/financiacion/simular', { monto, planId }))
      .data,
};
