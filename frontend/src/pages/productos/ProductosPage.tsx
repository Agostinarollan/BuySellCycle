import { EyeOutlined, SyncOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Col,
  Descriptions,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { useEffect, useState } from 'react';
import { categoriasNivel2Api } from '../../api/categorias.api';
import { obtenerMensajeError } from '../../api/http';
import { marcasApi } from '../../api/marcas.api';
import { productosApi } from '../../api/productos.api';
import type { ProductoForm } from '../../api/productos.api';
import CrudPage from '../../components/CrudPage';
import ImagenUpload from '../../components/ImagenUpload';
import type { CategoriaNivel2, Marca, Producto } from '../../types';
import { calcularPrecioContado, calcularPrecioLista } from '../../utils/calculos';
import {
  COLOR_ESTADO_PRODUCTO,
  formatearFecha,
  formatearMoneda,
  haceCuanto,
} from '../../utils/formato';

/** Vista previa EN VIVO de los precios mientras se completa el formulario. */
function VistaPreviaPrecios() {
  const form = Form.useFormInstance<ProductoForm>();
  const costoNeto = Form.useWatch('costoNeto', form);
  const utilidad = Form.useWatch('utilidad', form);
  const descuento = Form.useWatch('descuentoContado', form);

  const precioLista = calcularPrecioLista(costoNeto, utilidad);
  const precioContado = calcularPrecioContado(precioLista, descuento);

  return (
    <Descriptions size="small" bordered column={1}>
      <Descriptions.Item label="Precio de lista (calculado)">
        {formatearMoneda(precioLista)}
      </Descriptions.Item>
      <Descriptions.Item label="Precio contado (calculado)">
        {formatearMoneda(precioContado)}
      </Descriptions.Item>
    </Descriptions>
  );
}

export default function ProductosPage() {
  const { message } = App.useApp();
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<CategoriaNivel2[]>([]);
  const [version, setVersion] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [detalle, setDetalle] = useState<Producto | null>(null);

  useEffect(() => {
    void marcasApi.listar().then(setMarcas);
    void categoriasNivel2Api.listar().then(setCategorias);
  }, []);

  const sincronizar = async () => {
    setSincronizando(true);
    try {
      const r = await productosApi.sincronizarStock();
      message.success(`Proceso ejecutado: ${r.productosProcesados} productos`);
      setVersion((v) => v + 1); // recarga la tabla
    } catch (error) {
      message.error(obtenerMensajeError(error));
    } finally {
      setSincronizando(false);
    }
  };

  const verStock = async (producto: Producto) => {
    try {
      setDetalle(await productosApi.obtener(producto.id));
    } catch (error) {
      message.error(obtenerMensajeError(error));
    }
  };

  return (
    <>
      <CrudPage<Producto, ProductoForm>
        titulo="Productos"
        extraCabecera={
          <Tooltip title="Suma el stock de todos los depósitos y recalcula el estado">
            <Button icon={<SyncOutlined />} loading={sincronizando} onClick={sincronizar}>
              Sincronizar stock
            </Button>
          </Tooltip>
        }
        api={productosApi}
        version={version}
        columnas={[
          {
            title: 'Imagen',
            width: 70,
            render: (_, p) =>
              p.rutaImagen ? (
                <Image src={productosApi.urlImagen(p)} width={48} height={48} style={{ objectFit: 'cover' }} />
              ) : (
                '-'
              ),
          },
          { title: 'Nombre', dataIndex: 'nombre' },
          { title: 'Marca', render: (_, p) => p.marca?.nombre },
          {
            title: 'Categoría',
            render: (_, p) =>
              `${p.categoriaNivel2?.categoriaNivel1?.nombre ?? ''} › ${p.categoriaNivel2?.nombre ?? ''}`,
          },
          { title: 'Costo neto', render: (_, p) => formatearMoneda(p.costoNeto) },
          { title: 'Utilidad', render: (_, p) => `${p.utilidad}%` },
          { title: 'P. lista', render: (_, p) => formatearMoneda(p.precioLista) },
          { title: 'Desc. contado', render: (_, p) => `${p.descuentoContado}%` },
          { title: 'P. contado', render: (_, p) => formatearMoneda(p.precioContado) },
          { title: 'Stock total', dataIndex: 'stockTotal' },
          {
            title: 'Estado',
            render: (_, p) => <Tag color={COLOR_ESTADO_PRODUCTO[p.estado]}>{p.estado}</Tag>,
          },
          {
            title: 'Último mov.',
            render: (_, p) => (
              <Tooltip title={formatearFecha(p.fechaUltimoMovimientoStock)}>
                {haceCuanto(p.fechaUltimoMovimientoStock)}
              </Tooltip>
            ),
          },
        ]}
        aFormulario={(p) => ({
          nombre: p.nombre,
          costoNeto: Number(p.costoNeto),
          utilidad: Number(p.utilidad),
          descuentoContado: Number(p.descuentoContado),
          marcaId: p.marcaId,
          categoriaNivel2Id: p.categoriaNivel2Id,
        })}
        accionesExtra={(p) => (
          <>
            <Tooltip title="Stock por depósito">
              <Button icon={<EyeOutlined />} onClick={() => verStock(p)} />
            </Tooltip>
            <ImagenUpload
              subir={(archivo) => productosApi.subirImagen(p.id, archivo)}
              alTerminar={() => setVersion((v) => v + 1)}
            />
          </>
        )}
        campos={
          <>
            <Form.Item name="nombre" label="Nombre" rules={[{ required: true, whitespace: true, message: 'Obligatorio' }]}>
              <Input />
            </Form.Item>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item name="costoNeto" label="Costo neto" rules={[{ required: true, message: 'Obligatorio' }]}>
                  <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="utilidad" label="Utilidad %" rules={[{ required: true, message: 'Obligatoria' }]}>
                  <InputNumber min={0} max={999} precision={2} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="descuentoContado" label="% desc. contado" rules={[{ required: true, message: 'Obligatorio' }]}>
                  <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <VistaPreviaPrecios />
            <Form.Item name="marcaId" label="Marca" rules={[{ required: true, message: 'Elegí una marca' }]} style={{ marginTop: 16 }}>
              <Select showSearch={{ optionFilterProp: 'label' }} options={marcas.map((m) => ({ value: m.id, label: m.nombre }))} />
            </Form.Item>
            <Form.Item name="categoriaNivel2Id" label="Categoría (nivel 2)" rules={[{ required: true, message: 'Elegí una categoría' }]}>
              <Select
                showSearch={{ optionFilterProp: 'label' }}
                options={categorias.map((c) => ({
                  value: c.id,
                  label: `${c.categoriaNivel1?.nombre ?? ''} › ${c.nombre}`,
                }))}
              />
            </Form.Item>
          </>
        }
      />

      <Modal
        open={detalle !== null}
        title={`Stock por depósito - ${detalle?.nombre ?? ''}`}
        footer={null}
        onCancel={() => setDetalle(null)}
      >
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={detalle?.stocks ?? []}
          columns={[
            { title: 'Depósito', render: (_, s) => `${s.deposito?.codigo} - ${s.deposito?.nombre}` },
            { title: 'Stock', dataIndex: 'stock' },
          ]}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>Stock total</Table.Summary.Cell>
              <Table.Summary.Cell index={1}>{detalle?.stockTotal}</Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
        <p>Última sincronización: {formatearFecha(detalle?.fechaUltimaSincronizacionStock)}</p>
      </Modal>
    </>
  );
}
