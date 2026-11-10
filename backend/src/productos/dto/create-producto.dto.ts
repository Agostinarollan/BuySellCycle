import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * El cliente SOLO envía los datos "de entrada".
 * precioLista, precioContado, stockTotal y estado los calcula el backend.
 */
export class CreateProductoDto {
  @MaxLength(150, { message: 'Admite hasta 150 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @Min(0.01, { message: 'El costo neto debe ser mayor a 0' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo neto debe ser un número con hasta 2 decimales' },
  )
  costoNeto: number;

  @Min(0, { message: 'La utilidad no puede ser negativa' })
  @Max(999, { message: 'La utilidad no puede superar 999%' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La utilidad debe ser numérica' },
  )
  utilidad: number;

  @Min(0, { message: 'El descuento no puede ser negativo' })
  @Max(100, { message: 'El descuento no puede superar 100%' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El descuento contado debe ser numérico' },
  )
  descuentoContado: number;

  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'La marca es obligatoria' })
  marcaId: number;

  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'La categoría nivel 2 es obligatoria' })
  categoriaNivel2Id: number;
}
