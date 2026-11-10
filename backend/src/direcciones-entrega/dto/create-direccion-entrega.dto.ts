import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDireccionEntregaDto {
  @MaxLength(255, { message: 'Admite hasta 255 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @IsOptional()
  @IsBoolean({ message: 'Debe ser verdadero o falso' })
  esPrincipal?: boolean;
}
