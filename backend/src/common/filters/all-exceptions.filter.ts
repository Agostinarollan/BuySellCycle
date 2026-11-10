import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ErroresService } from '../../errores/errores.service';

// @Catch() sin parámetros = atrapa CUALQUIER excepción de la aplicación.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Al registrarlo como APP_FILTER en AppModule, Nest le inyecta dependencias.
  constructor(private readonly errores: ErroresService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, mensaje } = this.traducir(exception);

    // Guardamos el error en Firestore SIN esperar (no demoramos la respuesta).
    // No registramos los POST /api/errores fallidos para evitar bucles.
    if (!request.url.startsWith('/api/errores')) {
      const e =
        exception instanceof Error ? exception : new Error(String(exception));
      void this.errores.registrar({
        tipoSistema: 'backend',
        nombre: e.name,
        mensaje: Array.isArray(mensaje) ? mensaje.join(' | ') : mensaje,
        stack: e.stack ?? null,
        statusCode,
        metodo: request.method,
        ruta: request.url,
        userAgent: request.headers['user-agent'] ?? null,
        contexto: {
          params: request.params,
          query: request.query,
          // En los GET el body llega undefined y Firestore no acepta undefined.
          body: (request.body as unknown) ?? null,
          mensajeOriginal: e.message,
        },
      });
    }

    response.status(statusCode).json({
      statusCode,
      mensaje,
      ruta: request.url,
      fecha: new Date().toISOString(),
    });
  }

  // Convierte cualquier error en un código HTTP + mensaje legible.
  private traducir(exception: unknown): {
    statusCode: number;
    mensaje: string | string[];
  } {
    if (exception instanceof HttpException) {
      const respuesta = exception.getResponse();
      const mensaje =
        typeof respuesta === 'string'
          ? respuesta
          : ((respuesta as { message?: string | string[] }).message ??
            exception.message);
      return { statusCode: exception.getStatus(), mensaje };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // violación de UNIQUE
          return {
            statusCode: HttpStatus.CONFLICT,
            mensaje: `Ya existe un registro con ese valor (${String(
              (exception.meta?.target as string[] | string) ?? 'campo único',
            )})`,
          };
        case 'P2003': // violación de FOREIGN KEY
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            mensaje: 'La referencia a otra entidad no es válida',
          };
        case 'P2025': // registro no encontrado
          return {
            statusCode: HttpStatus.NOT_FOUND,
            mensaje: 'Registro no encontrado',
          };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      mensaje: 'Error interno del servidor',
    };
  }
}
