import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
export class CreateSucursalDto {
@MaxLength(100, { message: 'Admite hasta 100 caracteres' })
@IsString({ message: 'El nombre debe ser texto' })
@IsNotEmpty({ message: 'El nombre es obligatorio' })
nombre: string;
@Min(1, { message: 'Debe ser mayor a 0' })
@IsInt({ message: 'La provincia es obligatoria' })
provinciaId: number;
@Min(1, { message: 'Debe ser mayor a 0' })
@IsInt({ message: 'La localidad es obligatoria' })
localidadId: number;
}   