import { create } from 'zustand';
import type { Producto } from '../types';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

/**
 * "Carrito" de la venta en curso. Al ser global, si el usuario sale de la
 * pantalla Nueva Venta y vuelve, los productos elegidos siguen ahí.
 */
interface VentaState {
  items: ItemCarrito[];
  agregar: (producto: Producto, cantidad: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  quitar: (productoId: number) => void;
  vaciar: () => void;
}

export const useVentaStore = create<VentaState>((set) => ({
  items: [],

  agregar: (producto, cantidad) =>
    set((estado) => {
      const existente = estado.items.find((i) => i.producto.id === producto.id);
      if (existente) {
        // Si ya estaba, sumamos la cantidad en vez de duplicar el renglón.
        return {
          items: estado.items.map((i) =>
            i.producto.id === producto.id
              ? { ...i, cantidad: i.cantidad + cantidad }
              : i,
          ),
        };
      }
      return { items: [...estado.items, { producto, cantidad }] };
    }),

  cambiarCantidad: (productoId, cantidad) =>
    set((estado) => ({
      items: estado.items.map((i) =>
        i.producto.id === productoId ? { ...i, cantidad } : i,
      ),
    })),

  quitar: (productoId) =>
    set((estado) => ({
      items: estado.items.filter((i) => i.producto.id !== productoId),
    })),

  vaciar: () => set({ items: [] }),
}));
