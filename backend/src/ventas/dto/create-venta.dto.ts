import { ModoPago, TipoEntrega } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ItemProductoDto } from '../../common/dto/item-producto.dto';

export class CreateVentaDto {
  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'El cliente es obligatorio' })
  clienteId: number;

  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'El usuario (vendedor) es obligatorio' })
  usuarioId: number;

  @IsEnum(ModoPago, { message: 'El modo de pago debe ser CONTADO o PLAN' })
  modoPago: ModoPago;

  // @ValidateIf: esta validación SOLO se aplica si el pago es con PLAN.
  @ValidateIf((venta: CreateVentaDto) => venta.modoPago === ModoPago.PLAN)
  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'Para pagar con plan hay que elegir un plan' })
  planId?: number;

  @IsEnum(TipoEntrega, {
    message: 'El tipo de entrega debe ser RETIRO_SUCURSAL o DOMICILIO',
  })
  tipoEntrega: TipoEntrega;

  @ValidateIf(
    (venta: CreateVentaDto) =>
      venta.tipoEntrega === TipoEntrega.RETIRO_SUCURSAL,
  )
  @Min(1, { message: 'Debe ser mayor a 0' })
  @IsInt({ message: 'Para retirar en sucursal hay que elegir la sucursal' })
  sucursalId?: number;

  @ValidateIf(
    (venta: CreateVentaDto) => venta.tipoEntrega === TipoEntrega.DOMICILIO,
  )
  @MaxLength(255, { message: 'Admite hasta 255 caracteres' })
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({
    message: 'Para entrega a domicilio la dirección es obligatoria',
  })
  direccionEntrega?: string;

  @Type(() => ItemProductoDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'La venta debe tener al menos un producto' })
  @IsArray({ message: 'Debe ser una lista' })
  items: ItemProductoDto[];
}
