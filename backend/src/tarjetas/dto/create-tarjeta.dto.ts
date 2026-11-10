import { TipoTarjeta } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTarjetaDto {
  @MaxLength(100, { message: 'Admite hasta 100 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEnum(TipoTarjeta, { message: 'El tipo debe ser CREDITO o DEBITO' })
  tipo: TipoTarjeta;
}
