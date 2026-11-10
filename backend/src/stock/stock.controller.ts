import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { EgresoStockDto } from './dto/egreso-stock.dto';
import { IngresoStockDto } from './dto/ingreso-stock.dto';
import { TransferenciaStockDto } from './dto/transferencia-stock.dto';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly service: StockService) {}

  @Get('productos/:productoId')
  stockPorProducto(@Param('productoId', ParseIntPipe) productoId: number) {
    return this.service.stockPorProducto(productoId);
  }

  @Get('movimientos')
  listarMovimientos(
    @Query('productoId', new ParseIntPipe({ optional: true }))
    productoId?: number,
  ) {
    return this.service.listarMovimientos(productoId);
  }

  @Post('ingreso')
  ingreso(@Body() dto: IngresoStockDto) {
    return this.service.ingreso(dto);
  }

  @Post('egreso')
  egreso(@Body() dto: EgresoStockDto) {
    return this.service.egreso(dto);
  }

  @Post('transferencia')
  transferencia(@Body() dto: TransferenciaStockDto) {
    return this.service.transferencia(dto);
  }
}
