import { Global, Module } from '@nestjs/common';
import { ErroresController } from './errores.controller';
import { ErroresService } from './errores.service';

// @Global: cualquier módulo puede inyectar ErroresService sin importarlo.
@Global()
@Module({
  controllers: [ErroresController],
  providers: [ErroresService],
  exports: [ErroresService],
})
export class ErroresModule {}
