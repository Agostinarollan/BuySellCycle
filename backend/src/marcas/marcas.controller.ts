import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { MarcasService } from './marcas.service';

@Controller('marcas') // -> /api/marcas
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  @Get()
  findAll() {
    return this.marcasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.marcasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMarcaDto) {
    return this.marcasService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMarcaDto) {
    return this.marcasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.marcasService.remove(id);
  }
}
