import { Module } from '@nestjs/common';
import { UbicacionesModule } from '../ubicaciones/ubicaciones.module';
import { SucursalesController } from './sucursales.controller';
import { SucursalesService } from './sucursales.service';

@Module({
  imports: [UbicacionesModule],
  controllers: [SucursalesController],
  providers: [SucursalesService],
  exports: [SucursalesService],
})
export class SucursalesModule {}
