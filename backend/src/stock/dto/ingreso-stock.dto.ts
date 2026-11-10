import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class IngresoStockDto {
  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'El producto es obligatorio' })
  productoId: number;

  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'El depósito es obligatorio' })
  depositoId: number;

  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  cantidad: number;

  @IsOptional()
  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'Debe ser un número entero' })
  proveedorId?: number;

  @IsOptional()
  @MaxLength(255, { message: 'Admite hasta 255 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  observacion?: string;
}
