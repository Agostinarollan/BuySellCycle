import { Module } from '@nestjs/common';
import { PdfModule } from '../pdf/pdf.module';
import { PresupuestosController } from './presupuestos.controller';
import { PresupuestosService } from './presupuestos.service';

@Module({
  imports: [PdfModule],
  controllers: [PresupuestosController],
  providers: [PresupuestosService],
})
export class PresupuestosModule {}
