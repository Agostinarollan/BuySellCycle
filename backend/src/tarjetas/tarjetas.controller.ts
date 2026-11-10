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
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto';
import { TarjetasService } from './tarjetas.service';

@Controller('tarjetas')
export class TarjetasController {
  constructor(private readonly service: TarjetasService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTarjetaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTarjetaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

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
