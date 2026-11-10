import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/** Lo que envía el FRONTEND cuando captura un error. */
export class CreateErrorDto {
  @MaxLength(200, { message: 'Admite hasta 200 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty()
  nombre: string;

  @MaxLength(2000, { message: 'Admite hasta 2000 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty()
  mensaje: string;

  @IsOptional()
  @MaxLength(10000, { message: 'Admite hasta 10000 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  stack?: string;

  @IsOptional()
  @IsInt({ message: 'Debe ser un número entero' })
  statusCode?: number;

  @IsOptional()
  @MaxLength(10, { message: 'Admite hasta 10 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  metodo?: string;

  @IsOptional()
  @MaxLength(500, { message: 'Admite hasta 500 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  ruta?: string;

  @IsOptional()
  @IsObject()
  contexto?: Record<string, unknown>;
}
