import { BadRequestException } from '@nestjs/common';
import { Prisma, TipoMovimientoStock } from '@prisma/client';
import { calcularEstadoProducto } from '../common/utils/calculos';

/**
 * Funciones de stock que reciben "tx" (el cliente de Prisma DENTRO de una
 * transacción). Así pueden participar de la misma transacción que la
 * operación que las llama (movimiento de stock, venta, cancelación...).
 */

/** Recalcula stockTotal sumando el stock de TODOS los depósitos. */
export async function sincronizarStockProducto(
  tx: Prisma.TransactionClient,
  productoId: number,
  ahora: Date = new Date(),
) {
  const suma = await tx.stockProductoDeposito.aggregate({
    where: { productoId, archivado: false },
    _sum: { stock: true },
  });
  const stockTotal = suma._sum.stock ?? 0;

  const producto = await tx.producto.findUniqueOrThrow({
    where: { id: productoId },
  });
  const referencia =
    producto.fechaUltimoMovimientoStock ?? producto.fechaCreacion;

  return tx.producto.update({
    where: { id: productoId },
    data: {
      stockTotal,
      fechaUltimaSincronizacionStock: ahora,
      estado: calcularEstadoProducto(stockTotal, referencia, ahora),
    },
  });
}

/** Suma stock en un depósito (crea la fila si todavía no existía). */
export async function sumarStock(
  tx: Prisma.TransactionClient,
  productoId: number,
  depositoId: number,
  cantidad: number,
) {
  await tx.stockProductoDeposito.upsert({
    where: { productoId_depositoId: { productoId, depositoId } },
    create: { productoId, depositoId, stock: cantidad },
    update: { stock: { increment: cantidad } },
  });
}

/**
 * Resta stock SOLO si alcanza. El WHERE "stock >= cantidad" y el
 * decremento se ejecutan en una única sentencia UPDATE, así dos
 * operaciones simultáneas nunca pueden dejar el stock en negativo.
 */
export async function restarStock(
  tx: Prisma.TransactionClient,
  productoId: number,
  depositoId: number,
  cantidad: number,
) {
  const resultado = await tx.stockProductoDeposito.updateMany({
    where: { productoId, depositoId, stock: { gte: cantidad } },
    data: { stock: { decrement: cantidad } },
  });
  if (resultado.count === 0)
    throw new BadRequestException(
      `Stock insuficiente del producto ${productoId} en el depósito ${depositoId}`,
    );
}

/** Registra la fecha del último movimiento de stock del producto. */
export async function marcarMovimiento(
  tx: Prisma.TransactionClient,
  productoId: number,
  ahora: Date = new Date(),
) {
  await tx.producto.update({
    where: { id: productoId },
    data: { fechaUltimoMovimientoStock: ahora },
  });
}

/**
 * Para una VENTA: descuenta la cantidad pedida recorriendo los depósitos
 * que tienen stock, empezando por el que más tiene.
 */
export async function descontarStockParaVenta(
  tx: Prisma.TransactionClient,
  productoId: number,
  cantidad: number,
  ventaId: number,
) {
  const stocks = await tx.stockProductoDeposito.findMany({
    where: { productoId, archivado: false, stock: { gt: 0 } },
    orderBy: { stock: 'desc' },
  });
  const disponible = stocks.reduce((acc, s) => acc + s.stock, 0);
  if (disponible < cantidad)
    throw new BadRequestException(
      `Stock insuficiente para el producto ${productoId}: hay ${disponible}, se piden ${cantidad}`,
    );

  let pendiente = cantidad;
  for (const fila of stocks) {
    if (pendiente === 0) break;
    const aDescontar = Math.min(fila.stock, pendiente);
    await restarStock(tx, productoId, fila.depositoId, aDescontar);
    await tx.movimientoStock.create({
      data: {
        tipo: TipoMovimientoStock.EGRESO,
        cantidad: aDescontar,
        productoId,
        depositoOrigenId: fila.depositoId,
        ventaId,
        observacion: `Venta #${ventaId}`,
      },
    });
    pendiente -= aDescontar;
  }
  await marcarMovimiento(tx, productoId);
  await sincronizarStockProducto(tx, productoId);
}
