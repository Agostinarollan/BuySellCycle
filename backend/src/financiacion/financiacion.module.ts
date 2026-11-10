import { Module } from '@nestjs/common';
import { PlanesModule } from '../planes/planes.module';
import { FinanciacionController } from './financiacion.controller';
import { FinanciacionService } from './financiacion.service';

@Module({
  imports: [PlanesModule],
  controllers: [FinanciacionController],
  providers: [FinanciacionService],
})
export class FinanciacionModule {}
