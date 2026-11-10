import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'La tarjeta es obligatoria' })
  tarjetaId: number;

  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'El banco es obligatorio' })
  bancoId: number;

  @Min(1, { message: 'Debe haber al menos 1 cuota' })
  @Max(72, { message: 'Máximo 72 cuotas' })
  @IsInt({ message: 'La cantidad de cuotas debe ser un entero' })
  cantidadCuotas: number;

  @Min(0, { message: 'La tasa no puede ser negativa' })
  @Max(1000, { message: 'La tasa no puede superar 1000%' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La tasa debe ser numérica' })
  tasaFinanciacion: number;

  @IsOptional()
  @MaxLength(500, { message: 'Admite hasta 500 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  observaciones?: string;
}
