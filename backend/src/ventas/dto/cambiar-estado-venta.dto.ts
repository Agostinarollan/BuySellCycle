import { EstadoVenta } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CambiarEstadoVentaDto {
  @IsEnum(EstadoVenta, { message: 'Estado de venta inválido' })
  estado: EstadoVenta;

  // Obligatorio SOLO cuando se cancela manualmente.
  @ValidateIf(
    (dto: CambiarEstadoVentaDto) => dto.estado === EstadoVenta.CANCELADO,
  )
  @MaxLength(500, { message: 'Admite hasta 500 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'Para cancelar una venta el motivo es obligatorio' })
  motivoCancelacion?: string;
}
