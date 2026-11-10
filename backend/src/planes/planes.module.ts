import { Module } from '@nestjs/common';
import { BancosModule } from '../bancos/bancos.module';
import { TarjetasModule } from '../tarjetas/tarjetas.module';
import { PlanesController } from './planes.controller';
import { PlanesService } from './planes.service';

@Module({
  imports: [TarjetasModule, BancosModule],
  controllers: [PlanesController],
  providers: [PlanesService],
  exports: [PlanesService],
})
export class PlanesModule {}
