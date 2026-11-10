import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { SimularFinanciacionDto } from './dto/simular-financiacion.dto';
import { FinanciacionService } from './financiacion.service';

@Controller('financiacion')
export class FinanciacionController {
  constructor(private readonly service: FinanciacionService) {}

  // GET /api/financiacion/bancos?tarjetaId=1
  @Get('bancos')
  bancosPorTarjeta(@Query('tarjetaId', ParseIntPipe) tarjetaId: number) {
    return this.service.bancosPorTarjeta(tarjetaId);
  }

  @Post('simular')
  simular(@Body() dto: SimularFinanciacionDto) {
    return this.service.simular(dto);
  }
}
