import { Module } from '@nestjs/common';
import { UbicacionesModule } from '../ubicaciones/ubicaciones.module';
import { DepositosController } from './depositos.controller';
import { DepositosService } from './depositos.service';

@Module({
  imports: [UbicacionesModule],
  controllers: [DepositosController],
  providers: [DepositosService],
  exports: [DepositosService],
})
export class DepositosModule {}
    