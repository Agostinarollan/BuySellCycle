import { Module } from '@nestjs/common';
import { ClientesModule } from '../clientes/clientes.module';
import { DireccionesEntregaController } from './direcciones-entrega.controller';
import { DireccionesEntregaService } from './direcciones-entrega.service';

@Module({
  imports: [ClientesModule],
  controllers: [DireccionesEntregaController],
  providers: [DireccionesEntregaService],
})
export class DireccionesEntregaModule {}
