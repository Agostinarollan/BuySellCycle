import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErroresService } from './errores/errores.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Todas las rutas empiezan con /api (ej: http://localhost:3000/api/marcas)
  app.setGlobalPrefix('api');

  // Permite que el frontend (otro origen: puerto 5173) llame a esta API.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  });

  // Valida automáticamente todos los DTO que llegan en el body.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );

  // Errores que ocurren FUERA de una petición HTTP (tareas, promesas
  // olvidadas...). También se guardan en Firestore.
  const errores = app.get(ErroresService);
  process.on('unhandledRejection', (motivo) => {
    void errores.registrarBackend(motivo, { ruta: 'unhandledRejection' });
  });
  process.on('uncaughtException', (error) => {
    void errores.registrarBackend(error, { ruta: 'uncaughtException' });
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend escuchando en http://localhost:${port}/api`);
}
void bootstrap();
