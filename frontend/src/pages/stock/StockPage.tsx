import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Table,
  Tabs,
  Tag,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { depositosApi } from '../../api/depositos.api';
import { obtenerMensajeError } from '../../api/http';
import { productosApi } from '../../api/productos.api';
import { proveedoresApi } from '../../api/proveedores.api';
import { stockApi } from '../../api/stock.api';
import type {
  Deposito,
  MovimientoStock,
  Producto,
  Proveedor,
  StockProductoDeposito,
} from '../../types';
import { formatearFecha } from '../../utils/formato';

type TipoOperacion = 'ingreso' | 'egreso' | 'transferencia';

const COLOR_TIPO = { INGRESO: 'green', EGRESO: 'red', TRANSFERENCIA: 'blue' };

export default function StockPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [operacion, setOperacion] = useState<TipoOperacion>('ingreso');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productoId, setProductoId] = useState<number | undefined>();
  const [stockPorDeposito, setStockPorDeposito] = useState<StockProductoDeposito[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    void productosApi.listar().then(setProductos);
    void depositosApi.listar().then(setDepositos);
    void proveedoresApi.listar().then(setProveedores);
  }, []);

  // Refresca el stock por depósito y los movimientos del producto elegido.
  const refrescar = useCallback(async (id?: number) => {
    setMovimientos(await stockApi.movimientos(id));
    setStockPorDeposito(id ? await stockApi.porProducto(id) : []);
  }, []);

  useEffect(() => {
    void refrescar(productoId);
  }, [productoId, refrescar]);

  const confirmar = async () => {
    let valores;
    try {
      valores = await form.validateFields();
    } catch {
      return; // campos inválidos: el formulario ya muestra los errores
    }
    setGuardando(true);
    try {
      if (operacion === 'ingreso') await stockApi.ingreso(valores);
      if (operacion === 'egreso') await stockApi.egreso(valores);
      if (operacion === 'transferencia') await stockApi.transferencia(valores);
      message.success('Movimiento registrado');
      form.resetFields(['cantidad', 'observacion']);
      setProductoId(valores.productoId);
      await refrescar(valores.productoId);
    } catch (error) {
      message.error(obtenerMensajeError(error));
    } finally {
      setGuardando(false);
    }
  };

  const opcionesDepositos = depositos.map((d) => ({
    value: d.id,
    label: `${d.codigo} - ${d.nombre}`,
  }));

  return (
    <Row gutter={16}>
      <Col xs={24} lg={10}>
        <Card title="Registrar movimiento de stock">
          <Tabs
            activeKey={operacion}
            onChange={(k) => {
              setOperacion(k as TipoOperacion);
              form.resetFields();
            }}
            items={[
              { key: 'ingreso', label: 'Ingreso' },
              { key: 'egreso', label: 'Egreso' },
              { key: 'transferencia', label: 'Transferencia' },
            ]}
          />
          <Form form={form} layout="vertical">
            <Form.Item name="productoId" label="Producto" rules={[{ required: true, message: 'Elegí un producto' }]}>
              <Select
                showSearch={{ optionFilterProp: 'label' }}
                options={productos.map((p) => ({ value: p.id, label: `${p.nombre} (stock ${p.stockTotal})` }))}
                onChange={(id: number) => setProductoId(id)}
              />
            </Form.Item>

            {operacion === 'transferencia' ? (
              <>
                <Form.Item name="depositoOrigenId" label="Depósito ORIGEN (resta)" rules={[{ required: true, message: 'Obligatorio' }]}>
                  <Select options={opcionesDepositos} />
                </Form.Item>
                <Form.Item
                  name="depositoDestinoId"
                  label="Depósito DESTINO (suma)"
                  dependencies={['depositoOrigenId']}
                  rules={[
                    { required: true, message: 'Obligatorio' },
                    ({ getFieldValue }) => ({
                      validator: (_, valor) =>
                        valor && valor === getFieldValue('depositoOrigenId')
                          ? Promise.reject(new Error('Debe ser distinto del origen'))
                          : Promise.resolve(),
                    }),
                  ]}
                >
                  <Select options={opcionesDepositos} />
                </Form.Item>
              </>
            ) : (
              <Form.Item name="depositoId" label="Depósito" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Select options={opcionesDepositos} />
              </Form.Item>
            )}

            {operacion === 'ingreso' && (
              <Form.Item name="proveedorId" label="Proveedor (opcional)">
                <Select allowClear options={proveedores.map((p) => ({ value: p.id, label: p.razonSocial }))} />
              </Form.Item>
            )}

            <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true, message: 'Obligatoria' }]}>
              <InputNumber min={1} precision={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="observacion" label="Observación">
              <Input maxLength={255} />
            </Form.Item>
            <Button type="primary" block loading={guardando} onClick={confirmar}>
              Confirmar {operacion}
            </Button>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={14}>
        <Card title="Stock del producto por depósito" style={{ marginBottom: 16 }}>
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={stockPorDeposito}
            locale={{ emptyText: 'Elegí un producto para ver su stock' }}
            columns={[
              { title: 'Depósito', render: (_, s) => `${s.deposito?.codigo} - ${s.deposito?.nombre}` },
              { title: 'Stock', dataIndex: 'stock' },
            ]}
          />
        </Card>
        <Card title="Últimos movimientos">
          <Table
            rowKey="id"
            size="small"
            dataSource={movimientos}
            pagination={{ pageSize: 8 }}
            scroll={{ x: true }}
            columns={[
              { title: 'Fecha', render: (_, m) => formatearFecha(m.fechaCreacion) },
              { title: 'Tipo', render: (_, m) => <Tag color={COLOR_TIPO[m.tipo]}>{m.tipo}</Tag> },
              { title: 'Producto', render: (_, m) => m.producto?.nombre },
              { title: 'Cant.', dataIndex: 'cantidad' },
              { title: 'Origen', render: (_, m) => m.depositoOrigen?.codigo ?? '-' },
              { title: 'Destino', render: (_, m) => m.depositoDestino?.codigo ?? '-' },
              { title: 'Obs.', render: (_, m) => m.observacion ?? (m.ventaId ? `Venta #${m.ventaId}` : '') },
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
}
