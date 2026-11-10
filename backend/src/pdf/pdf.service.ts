import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { PresupuestoCompleto } from '../presupuestos/presupuestos.include';
import { VentaCompleta } from '../ventas/ventas.include';

type Doc = PDFKit.PDFDocument;
type Columna = { titulo: string; ancho: number; alinear?: 'left' | 'right' };

const moneda = (valor: Prisma.Decimal | number | string | null) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
    Number(valor ?? 0),
  );
const fecha = (d: Date) =>
  d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

const ESTADOS_VENTA: Record<string, string> = {
  EN_PREPARACION: 'En preparación',
  DISPONIBLE_PARA_RETIRAR: 'Disponible para retirar',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

@Injectable()
export class PdfService {
  // ---------------------------- PRESUPUESTO ----------------------------
  generarPdfPresupuesto(p: PresupuestoCompleto): Promise<Buffer> {
    return this.crear((doc) => {
      this.encabezado(doc, `Presupuesto N° ${p.id}`);
      this.linea(doc, 'Fecha', fecha(p.fechaCreacion));
      this.linea(
        doc,
        'Válido hasta',
        p.fechaVencimiento.toLocaleDateString('es-AR'),
      );
      this.linea(
        doc,
        'Cliente',
        `${p.cliente.apellido}, ${p.cliente.nombre} (DNI ${p.cliente.dni})`,
      );
      this.linea(doc, 'Email', p.cliente.email);
      if (p.usuario)
        this.linea(
          doc,
          'Vendedor',
          `${p.usuario.apellido}, ${p.usuario.nombre}`,
        );
      doc.moveDown();

      this.tabla(
        doc,
        [
          { titulo: 'Producto', ancho: 185 },
          { titulo: 'Cant.', ancho: 40, alinear: 'right' },
          { titulo: 'P. contado', ancho: 70, alinear: 'right' },
          { titulo: 'P. lista', ancho: 70, alinear: 'right' },
          { titulo: 'Subt. contado', ancho: 65, alinear: 'right' },
          { titulo: 'Subt. lista', ancho: 65, alinear: 'right' },
        ],
        p.detalles.map((d) => [
          d.producto.nombre,
          String(d.cantidad),
          moneda(d.precioContado),
          moneda(d.precioLista),
          moneda(d.subtotalContado),
          moneda(d.subtotalLista),
        ]),
      );
      doc.moveDown();
      this.total(doc, 'TOTAL PAGO CONTADO', moneda(p.totalContado));
      this.total(
        doc,
        'TOTAL PRECIO DE LISTA (financiable)',
        moneda(p.totalLista),
      );
      if (p.observaciones) {
        doc.moveDown().font('Helvetica-Bold').text('Observaciones:');
        doc.font('Helvetica').text(p.observaciones);
      }
    });
  }

  // ------------------------------- VENTA -------------------------------
  generarPdfVenta(v: VentaCompleta): Promise<Buffer> {
    return this.crear((doc) => {
      this.encabezado(doc, `Venta N° ${v.id}`);
      this.linea(doc, 'Fecha', fecha(v.fechaCreacion));
      this.linea(doc, 'Estado', ESTADOS_VENTA[v.estado]);
      if (v.motivoCancelacion)
        this.linea(doc, 'Motivo cancelación', v.motivoCancelacion);
      this.linea(
        doc,
        'Cliente',
        `${v.cliente.apellido}, ${v.cliente.nombre} (DNI ${v.cliente.dni})`,
      );
      this.linea(doc, 'Email', v.cliente.email);
      this.linea(doc, 'Vendedor', `${v.usuario.apellido}, ${v.usuario.nombre}`);

      if (v.tipoEntrega === 'RETIRO_SUCURSAL' && v.sucursal) {
        this.linea(
          doc,
          'Entrega',
          `Retiro en sucursal ${v.sucursal.nombre} (${v.sucursal.localidad.nombre})`,
        );
      } else {
        this.linea(doc, 'Entrega', `A domicilio: ${v.direccionEntrega ?? ''}`);
      }
      if (v.modoPago === 'PLAN' && v.plan) {
        this.linea(
          doc,
          'Pago',
          `Plan ${v.plan.tarjeta.nombre} - ${v.plan.banco.nombre}: ${v.cantidadCuotas} cuotas, tasa ${Number(v.tasaFinanciacion)}%`,
        );
      } else {
        this.linea(doc, 'Pago', 'Contado');
      }
      doc.moveDown();

      this.tabla(
        doc,
        [
          { titulo: 'Producto', ancho: 255 },
          { titulo: 'Cantidad', ancho: 60, alinear: 'right' },
          { titulo: 'Precio unit.', ancho: 90, alinear: 'right' },
          { titulo: 'Subtotal', ancho: 90, alinear: 'right' },
        ],
        v.detalles.map((d) => [
          d.producto.nombre,
          String(d.cantidad),
          moneda(d.precioUnitario),
          moneda(d.subtotal),
        ]),
      );
      doc.moveDown();
      this.total(doc, 'Subtotal', moneda(v.subtotal));
      if (v.modoPago === 'PLAN') {
        this.total(doc, 'Total financiado', moneda(v.total));
        this.total(doc, `${v.cantidadCuotas} cuotas de`, moneda(v.montoCuota));
      } else {
        this.total(doc, 'TOTAL', moneda(v.total));
      }
    });
  }

  // ------------------------------ helpers ------------------------------

  /** Crea el documento y junta los "pedacitos" (chunks) en un único Buffer. */
  private crear(dibujar: (doc: Doc) => void): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const partes: Buffer[] = [];
      doc.on('data', (parte: Buffer) => partes.push(parte));
      doc.on('end', () => resolve(Buffer.concat(partes)));
      doc.on('error', reject);
      dibujar(doc);
      doc.end();
    });
  }

  private encabezado(doc: Doc, titulo: string) {
    doc.font('Helvetica-Bold').fontSize(18).text('BuySellCycle S.R.L.');
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#555')
      .text('Sistema de gestión de comercio');
    doc.fillColor('#000').moveDown();
    doc.font('Helvetica-Bold').fontSize(14).text(titulo);
    doc.moveDown(0.5).fontSize(10);
  }

  private linea(doc: Doc, etiqueta: string, valor: string) {
    doc.font('Helvetica-Bold').text(`${etiqueta}: `, { continued: true });
    doc.font('Helvetica').text(valor);
  }

  private tabla(doc: Doc, columnas: Columna[], filas: string[][]) {
    const x0 = doc.page.margins.left;
    const dibujarFila = (celdas: string[], negrita: boolean) => {
      const y = doc.y;
      let x = x0;
      doc.font(negrita ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
      let alto = 0;
      celdas.forEach((texto, i) => {
        const col = columnas[i];
        doc.text(texto, x + 2, y, {
          width: col.ancho - 4,
          align: col.alinear ?? 'left',
        });
        alto = Math.max(alto, doc.y - y);
        x += col.ancho;
      });
      doc.y = y + alto + 4;
      doc
        .moveTo(x0, doc.y - 2)
        .lineTo(x, doc.y - 2)
        .strokeColor('#ccc')
        .stroke();
    };
    dibujarFila(
      columnas.map((c) => c.titulo),
      true,
    );
    filas.forEach((f) => dibujarFila(f, false));
    doc.x = x0;
  }

  private total(doc: Doc, etiqueta: string, valor: string) {
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(`${etiqueta}: ${valor}`, { align: 'right' });
  }
}
