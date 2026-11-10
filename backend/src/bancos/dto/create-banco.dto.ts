import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBancoDto {
  @MaxLength(100, { message: 'Admite hasta 100 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;
}
