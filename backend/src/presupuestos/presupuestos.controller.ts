import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  StreamableFile,
} from '@nestjs/common';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { PresupuestosService } from './presupuestos.service';

@Controller('presupuestos')
export class PresupuestosController {
  constructor(private readonly service: PresupuestosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePresupuestoDto) {
    return this.service.create(dto);
  }

  @Get(':id/pdf')
  async pdf(@Param('id', ParseIntPipe) id: number) {
    const buffer = await this.service.generarPdf(id);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `inline; filename="presupuesto-${id}.pdf"`,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
