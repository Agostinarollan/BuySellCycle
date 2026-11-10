import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PdfModule } from '../pdf/pdf.module';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';

@Module({
  imports: [PdfModule, MailModule],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}
