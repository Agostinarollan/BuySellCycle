import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ItemProductoDto } from '../../common/dto/item-producto.dto';

export class CreatePresupuestoDto {
  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'El cliente es obligatorio' })
  clienteId: number;

  @IsOptional()
  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'Debe ser un número entero' })
  usuarioId?: number;

  @IsDateString({}, { message: 'La fecha de vencimiento no es válida' })
  fechaVencimiento: string;

  @IsOptional()
  @MaxLength(500, { message: 'Admite hasta 500 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  observaciones?: string;

  // @ValidateNested + @Type: valida CADA elemento del array con ItemProductoDto
  @Type(() => ItemProductoDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1, {
    message: 'El presupuesto debe tener al menos un producto',
  })
  @IsArray({ message: 'Debe ser una lista' })
  items: ItemProductoDto[];
}
