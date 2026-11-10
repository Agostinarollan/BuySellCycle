import { IsInt, IsNumber, Min } from 'class-validator';

export class SimularFinanciacionDto {
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser numérico' })
  monto: number;

  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'El plan es obligatorio' })
  planId: number;
}
