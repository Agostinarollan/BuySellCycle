import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
} from '@nestjs/common';
import { CreateErrorDto } from './dto/create-error.dto';
import { ErroresService } from './errores.service';
import type { TipoSistema } from './errores.types';

@Controller('errores')
export class ErroresController {
  constructor(private readonly service: ErroresService) {}

  // GET /api/errores                       -> todos
  // GET /api/errores?tipoSistema=frontend | backend
  @Get()
  listar(@Query('tipoSistema') tipoSistema?: TipoSistema) {
    if (tipoSistema && !['frontend', 'backend'].includes(tipoSistema))
      throw new BadRequestException('tipoSistema debe ser frontend o backend');
    return this.service.listar(tipoSistema);
  }

  @Post()
  registrar(
    @Body() dto: CreateErrorDto,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.service.registrarFrontend(dto, userAgent ?? null);
  }
}
