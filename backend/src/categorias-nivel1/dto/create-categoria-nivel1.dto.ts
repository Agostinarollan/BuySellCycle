import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CreateCategoriaNivel1Dto {
@MaxLength(100, { message: 'El nombre admite hasta 100 caracteres' })
@IsString({ message: 'El nombre debe ser texto' })
@IsNotEmpty({ message: 'El nombre es obligatorio' })
nombre: string;
}   