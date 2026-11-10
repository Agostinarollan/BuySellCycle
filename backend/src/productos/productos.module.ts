import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { ProductosTareas } from './productos.tareas';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService, ProductosTareas],
  exports: [ProductosService],
})
export class ProductosModule {}
