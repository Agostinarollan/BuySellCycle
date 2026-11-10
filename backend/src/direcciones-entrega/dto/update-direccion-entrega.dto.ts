import { PartialType } from '@nestjs/mapped-types';
import { CreateDireccionEntregaDto } from './create-direccion-entrega.dto';

export class UpdateDireccionEntregaDto extends PartialType(
  CreateDireccionEntregaDto,
) {}
