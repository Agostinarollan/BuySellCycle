import { create } from 'zustand';
import { ubicacionesApi } from '../api/ubicaciones.api';
import type { Localidad, Provincia } from '../types';

/**
 * Store GLOBAL de catálogos que casi nunca cambian (provincias y
 * localidades). Se piden una sola vez al backend y quedan en memoria
 * para todos los formularios (Depósito, Sucursal, Cliente...).
 */
interface CatalogosState {
  provincias: Provincia[];
  localidadesPorProvincia: Record<number, Localidad[]>;
  cargarProvincias: () => Promise<void>;
  cargarLocalidades: (provinciaId: number) => Promise<Localidad[]>;
}

export const useCatalogosStore = create<CatalogosState>((set, get) => ({
  provincias: [],
  localidadesPorProvincia: {},

  cargarProvincias: async () => {
    if (get().provincias.length > 0) return; // ya estaban cargadas
    const provincias = await ubicacionesApi.provincias();
    set({ provincias });
  },

  cargarLocalidades: async (provinciaId) => {
    const enCache = get().localidadesPorProvincia[provinciaId];
    if (enCache) return enCache;
    const localidades = await ubicacionesApi.localidades(provinciaId);
    set((estado) => ({
      localidadesPorProvincia: {
        ...estado.localidadesPorProvincia,
        [provinciaId]: localidades,
      },
    }));
    return localidades;
  },
}));
