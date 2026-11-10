import { RolUsuario } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
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

  @MinLength(4, {
    message: 'El nombre de usuario debe tener al menos 4 caracteres',
  })
  @MaxLength(50, { message: 'Admite hasta 50 caracteres' })
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message:
      'El nombre de usuario solo admite letras, números, punto y guion bajo',
  })
  @IsString({ message: 'Debe ser un texto' })
  nombreUsuario: string;

  @IsEnum(RolUsuario, { message: 'El rol debe ser ADMINISTRACION o VENDEDOR' })
  rol: RolUsuario;

  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'La sucursal es obligatoria' })
  sucursalId: number;
}
