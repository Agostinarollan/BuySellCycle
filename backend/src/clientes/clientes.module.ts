import { Module } from '@nestjs/common';
import { UbicacionesModule } from '../ubicaciones/ubicaciones.module';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

@Module({
  imports: [UbicacionesModule],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
