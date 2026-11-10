import axios, { AxiosError } from 'axios';
import { reportarError } from '../utils/errores';

export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/** Instancia única de Axios: todas las peticiones salen de acá. */
export const http = axios.create({ baseURL: API_URL });

// Interceptor de RESPUESTA: se ejecuta cuando vuelve cada respuesta.
http.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError) => {
    const status = error.response?.status;
    // Sin respuesta (backend caído / red) o error 5xx => lo registramos.
    // Los 4xx son errores de datos del usuario: se muestran en pantalla.
    if (!status || status >= 500) {
      void reportarError(error, {
        statusCode: status ?? null,
        metodo: error.config?.method?.toUpperCase() ?? null,
        ruta: `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`,
        contexto: { pantalla: window.location.pathname },
      });
    }
    return Promise.reject(error);
  },
);

/** Extrae un mensaje legible de un error de Axios (o de cualquier error). */
export function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { mensaje?: string | string[] }
      | undefined;
    if (data?.mensaje)
      return Array.isArray(data.mensaje) ? data.mensaje.join(' | ') : data.mensaje;
    if (!error.response) return 'No se pudo conectar con el servidor';
  }
  return error instanceof Error ? error.message : 'Error desconocido';
}
