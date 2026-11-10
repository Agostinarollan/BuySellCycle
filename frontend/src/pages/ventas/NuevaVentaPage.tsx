import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import Decimal from 'decimal.js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesApi } from '../../api/clientes.api';
import { direccionesApi } from '../../api/direcciones.api';
import { obtenerMensajeError } from '../../api/http';
import { productosApi } from '../../api/productos.api';
import { sucursalesApi } from '../../api/sucursales.api';
import { usuariosApi } from '../../api/usuarios.api';
import { ventasApi } from '../../api/ventas.api';
import type { VentaForm } from '../../api/ventas.api';
import SelectorFinanciacion from '../../components/SelectorFinanciacion';
import { useVentaStore } from '../../store/venta.store';
import type { ItemCarrito } from '../../store/venta.store';
import type {
  Cliente,
  DireccionEntrega,
  ModoPago,
  Plan,
  Producto,
  Sucursal,
  TipoEntrega,
  Usuario,
} from '../../types';
import { calcularFinanciacion } from '../../utils/calculos';
import { formatearMoneda } from '../../utils/formato';

export default function NuevaVentaPage() {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();

  // ---------- Estado GLOBAL (Zustand): el carrito ----------
  const { items, agregar, cambiarCantidad, quitar, vaciar } = useVentaStore();

  // ---------- Estado LOCAL (useState): el resto del formulario ----------
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [direcciones, setDirecciones] = useState<DireccionEntrega[]>([]);

  const [productoId, setProductoId] = useState<number>();
  const [cantidad, setCantidad] = useState(1);
  const [clienteId, setClienteId] = useState<number>();
  const [usuarioId, setUsuarioId] = useState<number>();
  const [modoPago, setModoPago] = useState<ModoPago>('CONTADO');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('RETIRO_SUCURSAL');
  const [sucursalId, setSucursalId] = useState<number>();
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    void productosApi.listar().then(setProductos);
    void clientesApi.listar().then(setClientes);
    void usuariosApi.listar().then(setUsuarios);
    void sucursalesApi.listar().then(setSucursales);
  }, []);

  // Al elegir cliente: traemos sus direcciones y precargamos la PRINCIPAL.
  useEffect(() => {
    if (!clienteId) return;
    void direccionesApi.porCliente(clienteId).then((lista) => {
      setDirecciones(lista);
      setDireccionEntrega(lista.find((d) => d.esPrincipal)?.direccion ?? '');
    });
  }, [clienteId]);

  const agregarProducto = () => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;
    const yaCargado = items.find((i) => i.producto.id === producto.id)?.cantidad ?? 0;
    if (yaCargado + cantidad > producto.stockTotal) {
      message.warning(`Stock insuficiente: hay ${producto.stockTotal} unidades`);
      return;
    }
    agregar(producto, cantidad);
    setProductoId(undefined);
    setCantidad(1);
  };

  // ---------- Cálculos de vista previa (decimal.js) ----------
  const precioDe = (p: Producto) => (modoPago === 'CONTADO' ? p.precioContado : p.precioLista);
  const subtotal = items.reduce(
    (acc, i) => acc.plus(new Decimal(precioDe(i.producto)).mul(i.cantidad)),
    new Decimal(0),
  );
  const financiacion =
    modoPago === 'PLAN' && plan
      ? calcularFinanciacion(subtotal, plan.tasaFinanciacion, plan.cantidadCuotas)
      : null;
  const total = financiacion ? financiacion.total : subtotal;

  const validar = (): string | null => {
    if (items.length === 0) return 'Agregá al menos un producto';
    if (!clienteId) return 'Elegí el cliente';
    if (!usuarioId) return 'Elegí el vendedor';
    if (modoPago === 'PLAN' && !plan) return 'Elegí tarjeta, banco y plan';
    if (tipoEntrega === 'RETIRO_SUCURSAL' && !sucursalId) return 'Elegí la sucursal de retiro';
    if (tipoEntrega === 'DOMICILIO' && !direccionEntrega.trim()) return 'Completá la dirección de entrega';
    return null;
  };

  const generarVenta = async () => {
    const problema = validar();
    if (problema) {
      message.error(problema);
      return;
    }
    const datos: VentaForm = {
      clienteId: clienteId!,
      usuarioId: usuarioId!,
      modoPago,
      planId: modoPago === 'PLAN' ? plan!.id : undefined,
      tipoEntrega,
      sucursalId: tipoEntrega === 'RETIRO_SUCURSAL' ? sucursalId : undefined,
      direccionEntrega: tipoEntrega === 'DOMICILIO' ? direccionEntrega.trim() : undefined,
      items: items.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
    };
    setGuardando(true);
    try {
      const { venta, email } = await ventasApi.crear(datos); // POST /api/ventas
      vaciar();
      modal.success({
        title: `Venta N° ${venta.id} generada`,
        content: email.enviado ? (
          <>
            Se envió el email al cliente.
            {email.previewUrl && (
              <div>
                <a href={email.previewUrl} target="_blank" rel="noreferrer">
                  Ver email (Ethereal)
                </a>
              </div>
            )}
          </>
        ) : (
          `La venta se guardó, pero el email falló: ${email.error}. Podés reenviarlo desde el detalle.`
        ),
        onOk: () => navigate(`/ventas/${venta.id}`),
      });
    } catch (error) {
      message.error(obtenerMensajeError(error));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      {/* ------------------------- 1. PRODUCTOS ------------------------- */}
      <Card title="1. Productos">
        <Space wrap style={{ marginBottom: 12 }}>
          <Select
            style={{ width: 360 }}
            placeholder="Producto"
            showSearch={{ optionFilterProp: 'label' }}
            value={productoId}
            onChange={setProductoId}
            options={productos.map((p) => ({
              value: p.id,
              label: `${p.nombre} — stock ${p.stockTotal}`,
              disabled: p.stockTotal === 0,
            }))}
          />
          <InputNumber min={1} precision={0} value={cantidad} onChange={(v) => setCantidad(v ?? 1)} />
          <Button icon={<PlusOutlined />} onClick={agregarProducto} disabled={!productoId}>
            Agregar
          </Button>
          {items.length > 0 && <Button onClick={vaciar}>Vaciar</Button>}
        </Space>
        <Table<ItemCarrito>
          rowKey={(i) => i.producto.id}
          size="small"
          pagination={false}
          dataSource={items}
          columns={[
            { title: 'Producto', render: (_, i) => i.producto.nombre },
            {
              title: 'Cantidad',
              render: (_, i) => (
                <InputNumber
                  min={1}
                  max={i.producto.stockTotal}
                  precision={0}
                  value={i.cantidad}
                  onChange={(v) => v && cambiarCantidad(i.producto.id, v)}
                />
              ),
            },
            {
              title: modoPago === 'CONTADO' ? 'Precio contado' : 'Precio lista',
              render: (_, i) => formatearMoneda(precioDe(i.producto)),
            },
            {
              title: 'Subtotal',
              render: (_, i) => formatearMoneda(new Decimal(precioDe(i.producto)).mul(i.cantidad)),
            },
            {
              title: '',
              render: (_, i) => <Button danger icon={<DeleteOutlined />} onClick={() => quitar(i.producto.id)} />,
            },
          ]}
        />
      </Card>

      {/* ---------------------- 2. CLIENTE Y VENDEDOR ---------------------- */}
      <Card title="2. Cliente y vendedor">
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="Cliente"
              showSearch={{ optionFilterProp: 'label' }}
              value={clienteId}
              onChange={setClienteId}
              options={clientes.map((c) => ({ value: c.id, label: `${c.apellido}, ${c.nombre} (${c.dni})` }))}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="Vendedor"
              value={usuarioId}
              onChange={setUsuarioId}
              options={usuarios.map((u) => ({ value: u.id, label: `${u.apellido}, ${u.nombre}` }))}
            />
          </Col>
        </Row>
      </Card>

      {/* --------------------------- 3. PAGO --------------------------- */}
      <Card title="3. Modo de pago">
        <Radio.Group
          value={modoPago}
          onChange={(e) => {
            setModoPago(e.target.value as ModoPago);
            setPlan(null);
          }}
          options={[
            { value: 'CONTADO', label: 'Contado (precio contado)' },
            { value: 'PLAN', label: 'Plan (precio de lista + financiación)' },
          ]}
        />
        {modoPago === 'PLAN' && (
          <div style={{ marginTop: 16 }}>
            <SelectorFinanciacion onChange={setPlan} />
          </div>
        )}
      </Card>

      {/* -------------------------- 4. ENTREGA -------------------------- */}
      <Card title="4. Entrega">
        <Radio.Group
          value={tipoEntrega}
          onChange={(e) => setTipoEntrega(e.target.value as TipoEntrega)}
          options={[
            { value: 'RETIRO_SUCURSAL', label: 'Retiro en sucursal' },
            { value: 'DOMICILIO', label: 'Entrega a domicilio' },
          ]}
        />
        <div style={{ marginTop: 16 }}>
          {tipoEntrega === 'RETIRO_SUCURSAL' ? (
            <Select
              style={{ width: 320 }}
              placeholder="Sucursal"
              value={sucursalId}
              onChange={setSucursalId}
              options={sucursales.map((s) => ({ value: s.id, label: `${s.nombre} (${s.localidad?.nombre ?? ''})` }))}
            />
          ) : (
            <Space orientation="vertical" style={{ width: '100%' }}>
              {direcciones.length > 0 && (
                <Select
                  style={{ width: '100%' }}
                  placeholder="Usar una dirección guardada del cliente"
                  onChange={(texto: string) => setDireccionEntrega(texto)}
                  options={direcciones.map((d) => ({
                    value: d.direccion,
                    label: `${d.direccion}${d.esPrincipal ? ' (principal)' : ''}`,
                  }))}
                />
              )}
              {/* Texto libre: se guarda TAL CUAL en la venta (foto del momento) */}
              <Input.TextArea
                rows={2}
                maxLength={255}
                placeholder="Dirección de entrega"
                value={direccionEntrega}
                onChange={(e) => setDireccionEntrega(e.target.value)}
              />
            </Space>
          )}
        </div>
      </Card>

      {/* -------------------------- RESUMEN -------------------------- */}
      <Card title="Resumen">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Subtotal">{formatearMoneda(subtotal)}</Descriptions.Item>
          {financiacion && plan && (
            <>
              <Descriptions.Item label="Tasa de financiación">{plan.tasaFinanciacion}%</Descriptions.Item>
              <Descriptions.Item label="Cuotas">
                {plan.cantidadCuotas} cuotas de {formatearMoneda(financiacion.montoCuota)}
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="TOTAL">
            <Typography.Text strong>{formatearMoneda(total)}</Typography.Text>
          </Descriptions.Item>
        </Descriptions>
        <Alert
          style={{ marginTop: 12 }}
          type="info"
          showIcon
          title="Los importes definitivos los calcula el backend al guardar."
        />
        <Button type="primary" size="large" style={{ marginTop: 16 }} loading={guardando} onClick={generarVenta}>
          Generar venta
        </Button>
      </Card>
    </Space>
  );
}
