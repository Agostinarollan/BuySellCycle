import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // Ruta fija ANTES de ':id'
  @Post('procesos/sincronizar-stock')
  sincronizar() {
    return this.service.sincronizarStockYEstados();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // multipart/form-data con un campo llamado "imagen"
  @Post(':id/imagen')
  @UseInterceptors(FileInterceptor('imagen'))
  subirImagen(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    return this.service.subirImagen(id, archivo);
  }

  @Get(':id/imagen')
  async obtenerImagen(@Param('id', ParseIntPipe) id: number) {
    const buffer = await this.service.obtenerImagen(id);
    return new StreamableFile(buffer, { type: 'image/webp' });
  }
}
