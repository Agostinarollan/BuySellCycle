import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UbicacionesService } from './ubicaciones.service';

@Controller('provincias')
export class UbicacionesController {
  constructor(private readonly ubicacionesService: UbicacionesService) {}

  @Get()
  findProvincias() {
    return this.ubicacionesService.findProvincias();
  }

  @Get(':id/localidades')
  findLocalidades(@Param('id', ParseIntPipe) id: number) {
    return this.ubicacionesService.findLocalidades(id);
  }
}
