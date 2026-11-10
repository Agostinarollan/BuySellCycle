import { Module } from '@nestjs/common';
import { CategoriasNivel1Controller } from './categorias-nivel1.controller';
import { CategoriasNivel1Service } from './categorias-nivel1.service';

@Module({
  controllers: [CategoriasNivel1Controller],
  providers: [CategoriasNivel1Service],
  exports: [CategoriasNivel1Service],
})
export class CategoriasNivel1Module {}
