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
import { DireccionesEntregaService } from './direcciones-entrega.service';
import { CreateDireccionEntregaDto } from './dto/create-direccion-entrega.dto';
import { UpdateDireccionEntregaDto } from './dto/update-direccion-entrega.dto';

// Sin prefijo: las rutas se escriben completas en cada método.
@Controller()
export class DireccionesEntregaController {
  constructor(private readonly service: DireccionesEntregaService) {}

  @Get('clientes/:clienteId/direcciones')
  findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.service.findByCliente(clienteId);
  }

  @Post('clientes/:clienteId/direcciones')
  create(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Body() dto: CreateDireccionEntregaDto,
  ) {
    return this.service.create(clienteId, dto);
  }

  @Patch('direcciones/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDireccionEntregaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch('direcciones/:id/principal')
  marcarPrincipal(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarPrincipal(id);
  }

  @Delete('direcciones/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
