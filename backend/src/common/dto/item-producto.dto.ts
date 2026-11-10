import { IsInt, Min } from 'class-validator';

/** Un renglón "producto + cantidad" (lo usan Presupuesto y Venta). */
export class ItemProductoDto {
  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'Cada ítem debe indicar un producto' })
  productoId: number;

  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  cantidad: number;
}
