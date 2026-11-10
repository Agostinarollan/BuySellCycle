import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
export class CreateCategoriaNivel2Dto {
@MaxLength(100, { message: 'El nombre admite hasta 100 caracteres' })
@IsString({ message: 'El nombre debe ser texto' })
@IsNotEmpty({ message: 'El nombre es obligatorio' })
nombre: string;
@Min(1, { message: 'Debe ser mayor a 0' })
@IsInt({ message: 'La categoría nivel 1 es obligatoria' })
categoriaNivel1Id: number;
}