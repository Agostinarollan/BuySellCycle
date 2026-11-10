export type TipoSistema = 'frontend' | 'backend';

/** Estructura UNIFORME de cada error guardado en Firestore (colección "errores"). */
export interface RegistroError {
  tipoSistema: TipoSistema;
  nombre: string; // tipo de error: TypeError, NotFoundException, AxiosError...
  mensaje: string;
  stack: string | null;
  statusCode: number | null; // código HTTP si corresponde
  metodo: string | null; // GET, POST... (si corresponde)
  ruta: string | null; // endpoint del backend o pantalla del frontend
  userAgent: string | null; // navegador / cliente que hizo la petición
  contexto: Record<string, unknown> | null; // datos extra útiles
  fecha: string; // ISO 8601
}
