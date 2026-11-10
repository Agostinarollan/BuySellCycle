import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
export class CreateProveedorDto {
@MaxLength(150, { message: 'Admite hasta 150 caracteres' })
@IsString({ message: 'Debe ser un texto' })
@IsNotEmpty({ message: 'La razón social es obligatoria' })
razonSocial: string;
@Matches(/^\d{2}-\d{8}-\d$/, {
message: 'El CUIT debe tener el formato 20-12345678-9',
})
cuit: string;
}