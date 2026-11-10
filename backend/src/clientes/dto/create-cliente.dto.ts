import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClienteDto {
  @MaxLength(100, { message: 'Admite hasta 100 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @MaxLength(100, { message: 'Admite hasta 100 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @Matches(/^\d{7,8}$/, { message: 'El DNI debe tener 7 u 8 dígitos' })
  dni: string;

  @MaxLength(150, { message: 'Admite hasta 150 caracteres' })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email: string;

  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'La provincia es obligatoria' })
  provinciaId: number;

  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'La localidad es obligatoria' })
  localidadId: number;
}
