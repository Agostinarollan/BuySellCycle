import type { Producto } from '../types';
import { crearApiCrud } from './crud.api';
import { API_URL, http } from './http';

export interface ProductoForm {
  nombre: string;
  costoNeto: number;
  utilidad: number;
  descuentoContado: number;
  marcaId: number;
  categoriaNivel2Id: number;
}

export const productosApi = {
  ...crearApiCrud<Producto, ProductoForm>('/productos'),

  // Las imágenes viajan como multipart/form-data (no como JSON).
  subirImagen: async (id: number, archivo: File) => {
    const formData = new FormData();
    formData.append('imagen', archivo);
    return (await http.post<Producto>(`/productos/${id}/imagen`, formData)).data;
  },

  // URL para <img src=...>. El "?v=" evita que el navegador muestre una
  // versión vieja guardada en caché después de cambiar la imagen.
  urlImagen: (producto: Producto) =>
    `${API_URL}/productos/${producto.id}/imagen?v=${encodeURIComponent(
      producto.rutaImagen ?? '',
    )}`,

  sincronizarStock: async () =>
    (
      await http.post<{ productosProcesados: number; fecha: string }>(
        '/productos/procesos/sincronizar-stock',
      )
    ).data,
};
