import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import Decimal from 'decimal.js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesApi } from '../../api/clientes.api';
import { obtenerMensajeError } from '../../api/http';
import { presupuestosApi } from '../../api/presupuestos.api';
import { productosApi } from '../../api/productos.api';
import { usuariosApi } from '../../api/usuarios.api';
import type { Cliente, Producto, Usuario } from '../../types';
import { formatearMoneda } from '../../utils/formato';

interface Item {
  producto: Producto;
  cantidad: number;
}

interface CabeceraForm {
  clienteId: number;
  usuarioId?: number;
  fechaVencimiento: Dayjs;
  observaciones?: string;
}

export default function NuevoPresupuestoPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<CabeceraForm>();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  // Estado LOCAL (useState): los ítems solo importan a esta pantalla.
  const [items, setItems] = useState<Item[]>([]);
  const [productoElegido, setProductoElegido] = useState<number>();
  const [cantidad, setCantidad] = useState<number>(1);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    void clientesApi.listar().then(setClientes);
    void usuariosApi.listar().then(setUsuarios);
    void productosApi.listar().then(setProductos);
  }, []);

  const agregar = () => {
    const producto = productos.find((p) => p.id === productoElegido);
    if (!producto) return;
    if (items.some((i) => i.producto.id === producto.id)) {
      message.warning('Ese producto ya está en el presupuesto');
      return;
    }
    setItems([...items, { producto, cantidad }]);
    setProductoElegido(undefined);
    setCantidad(1);
  };

  // Totales con decimal.js (nunca sumar dinero con number)
  const totalContado = items.reduce(
    (acc, i) => acc.plus(new Decimal(i.producto.precioContado).mul(i.cantidad)),
    new Decimal(0),
  );
  const totalLista = items.reduce(
    (acc, i) => acc.plus(new Decimal(i.producto.precioLista).mul(i.cantidad)),
    new Decimal(0),
  );

  const guardar = async () => {
    let cabecera: CabeceraForm;
    try {
      cabecera = await form.validateFields();
    } catch {
      return; // campos inválidos: el formulario ya muestra los errores
    }
    if (items.length === 0) {
      message.error('Agregá al menos un producto');
      return;
    }
    setGuardando(true);
    try {
      const presupuesto = await presupuestosApi.crear({
        clienteId: cabecera.clienteId,
        usuarioId: cabecera.usuarioId,
        // fin del día elegido, en formato ISO (ej: 2026-10-15T23:59:59.999-03:00)
        fechaVencimiento: cabecera.fechaVencimiento.endOf('day').toISOString(),
        observaciones: cabecera.observaciones,
        items: items.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
      });
      message.success(`Presupuesto N° ${presupuesto.id} emitido`);
      window.open(presupuestosApi.urlPdf(presupuesto.id), '_blank');
      navigate('/presupuestos');
    } catch (error) {
      message.error(obtenerMensajeError(error));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card title="Nuevo presupuesto">
      <Form
        form={form}
        layout="vertical"
        initialValues={{ fechaVencimiento: dayjs().add(15, 'day') }}
      >
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item name="clienteId" label="Cliente" rules={[{ required: true, message: 'Elegí un cliente' }]}>
              <Select
                showSearch={{ optionFilterProp: 'label' }}
                options={clientes.map((c) => ({ value: c.id, label: `${c.apellido}, ${c.nombre} (${c.dni})` }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="usuarioId" label="Vendedor (opcional)">
              <Select allowClear options={usuarios.map((u) => ({ value: u.id, label: `${u.apellido}, ${u.nombre}` }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="fechaVencimiento"
              label="Válido hasta"
              rules={[{ required: true, message: 'Obligatorio' }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                disabledDate={(fecha) => fecha.isBefore(dayjs(), 'day')}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="observaciones" label="Observaciones">
          <Input.TextArea maxLength={500} rows={2} />
        </Form.Item>
      </Form>

      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          style={{ width: 320 }}
          placeholder="Producto"
          showSearch={{ optionFilterProp: 'label' }}
          value={productoElegido}
          onChange={setProductoElegido}
          options={productos.map((p) => ({ value: p.id, label: p.nombre }))}
        />
        <InputNumber min={1} precision={0} value={cantidad} onChange={(v) => setCantidad(v ?? 1)} />
        <Button icon={<PlusOutlined />} onClick={agregar} disabled={!productoElegido}>
          Agregar
        </Button>
      </Space>

      <Table<Item>
        rowKey={(i) => i.producto.id}
        pagination={false}
        dataSource={items}
        columns={[
          { title: 'Producto', render: (_, i) => i.producto.nombre },
          { title: 'Cantidad', dataIndex: 'cantidad' },
          { title: 'P. contado', render: (_, i) => formatearMoneda(i.producto.precioContado) },
          { title: 'P. lista', render: (_, i) => formatearMoneda(i.producto.precioLista) },
          {
            title: 'Subt. contado',
            render: (_, i) => formatearMoneda(new Decimal(i.producto.precioContado).mul(i.cantidad)),
          },
          {
            title: 'Subt. lista',
            render: (_, i) => formatearMoneda(new Decimal(i.producto.precioLista).mul(i.cantidad)),
          },
          {
            title: '',
            render: (_, i) => (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => setItems(items.filter((x) => x.producto.id !== i.producto.id))}
              />
            ),
          },
        ]}
      />

      <Typography.Title level={5} style={{ textAlign: 'right' }}>
        Total contado: {formatearMoneda(totalContado)} — Total lista: {formatearMoneda(totalLista)}
      </Typography.Title>
      <Space>
        <Button onClick={() => navigate('/presupuestos')}>Cancelar</Button>
        <Button type="primary" loading={guardando} onClick={guardar}>
          Emitir presupuesto
        </Button>
      </Space>
    </Card>
  );
}
