import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateErrorDto } from './dto/create-error.dto';
import { RegistroError, TipoSistema } from './errores.types';

const COLECCION = 'errores';
const TIMEOUT_MS = 5000;

/**
 * Si los emuladores de Firebase están apagados, las llamadas a Firestore
 * quedan "colgadas" mucho tiempo. Con esto cortamos a los 5 segundos.
 */
function conTimeout<T>(promesa: Promise<T>): Promise<T> {
  return Promise.race([
    promesa,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(new Error('Firestore no respondió (¿emuladores apagados?)')),
        TIMEOUT_MS,
      ),
    ),
  ]);
}

@Injectable()
export class ErroresService {
  private readonly logger = new Logger(ErroresService.name);

  constructor(private readonly firebase: FirebaseService) {}

  /**
   * Guarda un error en Firestore. NUNCA lanza excepciones: si Firestore
   * falla, solo lo escribe en consola (si no, un error al guardar un error
   * generaría otro error... y así infinitamente).
   */
  async registrar(
    datos: Omit<RegistroError, 'fecha'> & { fecha?: string },
  ): Promise<string | null> {
    try {
      const fecha = datos.fecha ? new Date(datos.fecha) : new Date();
      const ref = await conTimeout(
        this.firebase
          .firestore()
          .collection(COLECCION)
          .add({ ...datos, fecha: Timestamp.fromDate(fecha) }),
      );
      return ref.id;
    } catch (e) {
      this.logger.error(
        `No se pudo guardar el error en Firestore: ${(e as Error).message}`,
      );
      return null;
    }
  }

  /** Helper para errores del backend a partir de cualquier excepción. */
  registrarBackend(
    error: unknown,
    extra: Partial<Omit<RegistroError, 'tipoSistema' | 'fecha'>> = {},
  ) {
    const e = error instanceof Error ? error : new Error(String(error));
    return this.registrar({
      tipoSistema: 'backend',
      nombre: e.name,
      mensaje: e.message,
      stack: e.stack ?? null,
      statusCode: null,
      metodo: null,
      ruta: null,
      userAgent: null,
      contexto: null,
      ...extra,
    });
  }

  /** Errores enviados por el frontend (POST /api/errores). */
  async registrarFrontend(dto: CreateErrorDto, userAgent: string | null) {
    const id = await this.registrar({
      tipoSistema: 'frontend',
      nombre: dto.nombre,
      mensaje: dto.mensaje,
      stack: dto.stack ?? null,
      statusCode: dto.statusCode ?? null,
      metodo: dto.metodo ?? null,
      ruta: dto.ruta ?? null,
      userAgent,
      contexto: dto.contexto ?? null,
    });
    return { id, guardado: id !== null };
  }

  /** Listado (más recientes primero) con filtro opcional por tipo de sistema. */
  async listar(tipoSistema?: TipoSistema) {
    let consulta = this.firebase
      .firestore()
      .collection(COLECCION)
      .orderBy('fecha', 'desc')
      .limit(300);
    if (tipoSistema)
      consulta = consulta.where('tipoSistema', '==', tipoSistema);

    const snapshot = await conTimeout(consulta.get()).catch((e: Error) => {
      throw new ServiceUnavailableException(e.message);
    });
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: (data.fecha as Timestamp).toDate().toISOString(),
      };
    });
  }
}
