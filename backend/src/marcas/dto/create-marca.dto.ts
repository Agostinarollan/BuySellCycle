import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
// IMPORTANTE: class-validator ejecuta los decoradores de ABAJO hacia ARRIBA.
// Como en main.ts usamos stopAtFirstError, solo se informa el primer error
// de cada campo: por eso el chequeo más importante va más cerca del campo.
export class CreateMarcaDto {
    @MaxLength(100, { message: 'El nombre admite hasta 100 caracteres' })
    @IsString({ message: 'El nombre debe ser texto' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    nombre: string;
}