import axios from 'axios';

const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

interface ExtraError {
  statusCode?: number | null;
  metodo?: string | null;
  ruta?: string | null;
  contexto?: Record<string, unknown>;
}

/**
 * Envía un error del FRONTEND al backend (POST /api/errores), que lo guarda
 * en Firestore con la misma estructura que los errores del backend.
 * Usa axios "directo" (no la instancia http) para no pasar por el
 * interceptor: si falla el reporte, no queremos reportar ese fallo (bucle).
 */
export async function reportarError(error: unknown, extra: ExtraError = {}) {
  const e = error instanceof Error ? error : new Error(String(error));
  try {
    await axios.post(`${API_URL}/errores`, {
      nombre: e.name || 'Error',
      mensaje: e.message || 'Error sin mensaje',
      stack: e.stack?.slice(0, 9000),
      statusCode: extra.statusCode ?? undefined,
      metodo: extra.metodo ?? undefined,
      ruta: extra.ruta ?? window.location.pathname,
      contexto: extra.contexto,
    });
  } catch {
    console.error('No se pudo reportar el error al backend', e);
  }
}

/** Captura los errores "sueltos" de JavaScript y las promesas rechazadas. */
export function instalarCapturaErrores() {
  window.addEventListener('error', (evento) => {
    void reportarError(evento.error ?? evento.message, {
      contexto: { origen: 'window.onerror', archivo: evento.filename },
    });
  });
  window.addEventListener('unhandledrejection', (evento) => {
    // Los errores de Axios ya los reporta el interceptor.
    if (axios.isAxiosError(evento.reason)) return;
    void reportarError(evento.reason, {
      contexto: { origen: 'unhandledrejection' },
    });
  });
}
