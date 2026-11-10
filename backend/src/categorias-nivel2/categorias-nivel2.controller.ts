import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CategoriasNivel2Service } from './categorias-nivel2.service';
import { CreateCategoriaNivel2Dto } from './dto/create-categoria-nivel2.dto';
import { UpdateCategoriaNivel2Dto } from './dto/update-categoria-nivel2.dto';

@Controller('categorias-nivel2')
export class CategoriasNivel2Controller {
  constructor(private readonly service: CategoriasNivel2Service) {}

  // GET /api/categorias-nivel2?categoriaNivel1Id=3  (el filtro es opcional)
  @Get()
  findAll(
    @Query('categoriaNivel1Id', new ParseIntPipe({ optional: true }))
    categoriaNivel1Id?: number,
  ) {
    return this.service.findAll(categoriaNivel1Id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCategoriaNivel2Dto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaNivel2Dto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
