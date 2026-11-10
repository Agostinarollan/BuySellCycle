import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductosService } from './productos.service';

/** Ejecuta el proceso de sincronización automáticamente cada hora. */
@Injectable()
export class ProductosTareas {
  private readonly logger = new Logger(ProductosTareas.name);

  constructor(private readonly productos: ProductosService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sincronizarCadaHora() {
    const resultado = await this.productos.sincronizarStockYEstados();
    this.logger.log(
      `Sincronización automática: ${resultado.productosProcesados} productos`,
    );
  }
}
