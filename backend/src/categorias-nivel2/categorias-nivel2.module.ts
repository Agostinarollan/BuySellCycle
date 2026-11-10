import { Module } from '@nestjs/common';
import { CategoriasNivel1Module } from '../categorias-nivel1/categorias-nivel1.module';
import { CategoriasNivel2Controller } from './categorias-nivel2.controller';
import { CategoriasNivel2Service } from './categorias-nivel2.service';

@Module({
  imports: [CategoriasNivel1Module], // para poder inyectar CategoriasNivel1Service
  controllers: [CategoriasNivel2Controller],
  providers: [CategoriasNivel2Service],
})
export class CategoriasNivel2Module {}
