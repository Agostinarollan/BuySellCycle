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
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanesService } from './planes.service';

@Controller('planes')
export class PlanesController {
  constructor(private readonly service: PlanesService) {}

  // GET /api/planes?tarjetaId=1&bancoId=2
  @Get()
  findAll(
    @Query('tarjetaId', new ParseIntPipe({ optional: true }))
    tarjetaId?: number,
    @Query('bancoId', new ParseIntPipe({ optional: true })) bancoId?: number,
  ) {
    return this.service.findAll(tarjetaId, bancoId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePlanDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
