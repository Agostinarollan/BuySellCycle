// =============================================================
// Tipos del frontend. Reflejan lo que devuelve el backend (JSON).
// OJO: los Decimal de Prisma llegan como STRING ("1500.5").
// =============================================================

export type Dinero = string;

export interface Base {
  id: number;
  archivado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// ----------------------------- Ubicación -----------------------------
export interface Provincia extends Base {
  nombre: string;
}
export interface Localidad extends Base {
  nombre: string;
  provinciaId: number;
}

// ----------------------------- Guía 1 --------------------------------
export interface Marca extends Base {
  nombre: string;
}
export interface CategoriaNivel1 extends Base {
  nombre: string;
  categoriasNivel2?: CategoriaNivel2[];
}
export interface CategoriaNivel2 extends Base {
  nombre: string;
  categoriaNivel1Id: number;
  categoriaNivel1?: CategoriaNivel1;
}
export interface Deposito extends Base {
  codigo: string;
  nombre: string;
  provinciaId: number;
  localidadId: number;
  provincia?: Provincia;
  localidad?: Localidad;
}
export interface Sucursal extends Base {
  nombre: string;
  provinciaId: number;
  localidadId: number;
  provincia?: Provincia;
  localidad?: Localidad;
}
export type RolUsuario = 'ADMINISTRACION' | 'VENDEDOR';
export interface Usuario extends Base {
  nombre: string;
  apellido: string;
  dni: string;
  nombreUsuario: string;
  rol: RolUsuario;
  sucursalId: number;
  sucursal?: Sucursal;
}
export interface Cliente extends Base {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  provinciaId: number;
  localidadId: number;
  provincia?: Provincia;
  localidad?: Localidad;
  direcciones?: DireccionEntrega[];
}
export interface Proveedor extends Base {
  razonSocial: string;
  cuit: string;
}
export type EstadoProducto = 'DISPONIBLE' | 'ACTIVO' | 'INACTIVO';
export interface Producto extends Base {
  nombre: string;
  stockTotal: number;
  costoNeto: Dinero;
  utilidad: Dinero;
  precioLista: Dinero;
  descuentoContado: Dinero;
  precioContado: Dinero;
  estado: EstadoProducto;
  fechaUltimoMovimientoStock: string | null;
  fechaUltimaSincronizacionStock: string | null;
  rutaImagen: string | null;
  marcaId: number;
  categoriaNivel2Id: number;
  marca?: Marca;
  categoriaNivel2?: CategoriaNivel2;
  stocks?: StockProductoDeposito[];
}
export interface StockProductoDeposito extends Base {
  productoId: number;
  depositoId: number;
  stock: number;
  deposito?: Deposito;
}
export type TipoMovimientoStock = 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA';
export interface MovimientoStock extends Base {
  tipo: TipoMovimientoStock;
  cantidad: number;
  productoId: number;
  depositoOrigenId: number | null;
  depositoDestinoId: number | null;
  proveedorId: number | null;
  ventaId: number | null;
  observacion: string | null;
  producto?: { id: number; nombre: string };
  depositoOrigen?: { id: number; codigo: string; nombre: string } | null;
  depositoDestino?: { id: number; codigo: string; nombre: string } | null;
  proveedor?: { id: number; razonSocial: string } | null;
}
export interface DetallePresupuesto extends Base {
  productoId: number;
  cantidad: number;
  precioContado: Dinero;
  precioLista: Dinero;
  subtotalContado: Dinero;
  subtotalLista: Dinero;
  producto?: Producto;
}
export interface Presupuesto extends Base {
  clienteId: number;
  usuarioId: number | null;
  fechaVencimiento: string;
  observaciones: string | null;
  totalContado: Dinero;
  totalLista: Dinero;
  cliente?: Cliente;
  usuario?: Usuario | null;
  detalles?: DetallePresupuesto[];
}

// ----------------------------- Guía 2 --------------------------------
export interface DireccionEntrega extends Base {
  clienteId: number;
  direccion: string;
  esPrincipal: boolean;
}
export type TipoTarjeta = 'CREDITO' | 'DEBITO';
export interface Tarjeta extends Base {
  nombre: string;
  tipo: TipoTarjeta;
  rutaImagen: string | null;
}
export interface Banco extends Base {
  nombre: string;
}
export interface Plan extends Base {
  tarjetaId: number;
  bancoId: number;
  cantidadCuotas: number;
  tasaFinanciacion: Dinero;
  observaciones: string | null;
  tarjeta?: Tarjeta;
  banco?: Banco;
}
export interface Simulacion {
  monto: Dinero;
  tarjeta: string;
  banco: string;
  cantidadCuotas: number;
  tasaFinanciacion: Dinero;
  total: Dinero;
  montoCuota: Dinero;
}
export type ModoPago = 'CONTADO' | 'PLAN';
export type TipoEntrega = 'RETIRO_SUCURSAL' | 'DOMICILIO';
export type EstadoVenta =
  | 'EN_PREPARACION'
  | 'DISPONIBLE_PARA_RETIRAR'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';
export interface DetalleVenta extends Base {
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: Dinero;
  subtotal: Dinero;
  producto?: Producto;
}
export interface Venta extends Base {
  clienteId: number;
  usuarioId: number;
  modoPago: ModoPago;
  planId: number | null;
  cantidadCuotas: number | null;
  tasaFinanciacion: Dinero | null;
  tipoEntrega: TipoEntrega;
  sucursalId: number | null;
  direccionEntrega: string | null;
  estado: EstadoVenta;
  motivoCancelacion: string | null;
  subtotal: Dinero;
  total: Dinero;
  montoCuota: Dinero | null;
  fechaUltimoEnvioEmail: string | null;
  cliente?: Cliente;
  usuario?: Usuario;
  plan?: Plan | null;
  sucursal?: Sucursal | null;
  detalles?: DetalleVenta[];
}
export interface ResultadoEmail {
  enviado: boolean;
  previewUrl: string | null;
  error: string | null;
}

// ----------------------------- Errores -------------------------------
export type TipoSistema = 'frontend' | 'backend';
export interface RegistroError {
  id: string;
  tipoSistema: TipoSistema;
  nombre: string;
  mensaje: string;
  stack: string | null;
  statusCode: number | null;
  metodo: string | null;
  ruta: string | null;
  userAgent: string | null;
  contexto: Record<string, unknown> | null;
  fecha: string;
}
