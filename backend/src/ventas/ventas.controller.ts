import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { EstadoVenta } from '@prisma/client';
import { CambiarEstadoVentaDto } from './dto/cambiar-estado-venta.dto';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasService } from './ventas.service';

@Controller('ventas')
export class VentasController {
  constructor(private readonly service: VentasService) {}

  // GET /api/ventas?estado=EN_PREPARACION   (filtro opcional)
  @Get()
  findAll(
    @Query('estado', new ParseEnumPipe(EstadoVenta, { optional: true }))
    estado?: EstadoVenta,
  ) {
    return this.service.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVentaDto) {
    return this.service.create(dto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoVentaDto,
  ) {
    return this.service.cambiarEstado(id, dto);
  }

  @Get(':id/pdf')
  async pdf(@Param('id', ParseIntPipe) id: number) {
    const buffer = await this.service.generarPdf(id);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `inline; filename="venta-${id}.pdf"`,
    });
  }

  @Post(':id/enviar-email')
  enviarEmail(@Param('id', ParseIntPipe) id: number) {
    return this.service.enviarEmail(id);
  }
}
