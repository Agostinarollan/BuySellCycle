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
import { CategoriasNivel1Service } from './categorias-nivel1.service';
import { CreateCategoriaNivel1Dto } from './dto/create-categoria-nivel1.dto';
import { UpdateCategoriaNivel1Dto } from './dto/update-categoria-nivel1.dto';

@Controller('categorias-nivel1')
export class CategoriasNivel1Controller {
  constructor(private readonly service: CategoriasNivel1Service) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // IMPORTANTE: 'arbol' va ANTES de ':id'; si no, Nest interpretaría
  // la palabra "arbol" como si fuera un id.
  @Get('arbol')
  findArbol() {
    return this.service.findArbol();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCategoriaNivel1Dto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaNivel1Dto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
