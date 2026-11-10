import { FilePdfOutlined, MailOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Space,
  Table,
  Tag,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerMensajeError } from '../../api/http';
import { ventasApi } from '../../api/ventas.api';
import type { DetalleVenta, EstadoVenta, Venta } from '../../types';
import {
  COLOR_ESTADO_VENTA,
  ETIQUETA_ESTADO_VENTA,
  formatearFecha,
  formatearMoneda,
} from '../../utils/formato';

/** Mismas reglas que el backend (el backend es quien valida de verdad). */
function siguientesEstados(venta: Venta): EstadoVenta[] {
  switch (venta.estado) {
    case 'EN_PREPARACION':
      return [
        venta.tipoEntrega === 'RETIRO_SUCURSAL' ? 'DISPONIBLE_PARA_RETIRAR' : 'EN_CAMINO',
        'CANCELADO',
      ];
    case 'DISPONIBLE_PARA_RETIRAR':
    case 'EN_CAMINO':
      return ['ENTREGADO', 'CANCELADO'];
    default:
      return [];
  }
}

export default function VentaDetallePage() {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setVenta(await ventasApi.obtener(Number(id)));
    } catch (error) {
      message.error(obtenerMensajeError(error));
    }
  }, [id, message]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const cambiarEstado = async (estado: EstadoVenta, motivoCancelacion?: string) => {
    try {
      setVenta(await ventasApi.cambiarEstado(Number(id), estado, motivoCancelacion));
      message.success(`Estado: ${ETIQUETA_ESTADO_VENTA[estado]}`);
    } catch (error) {
      message.error(obtenerMensajeError(error));
    }
  };

  const enviarEmail = async () => {
    setEnviando(true);
    try {
      const r = await ventasApi.enviarEmail(Number(id));
      modal.success({
        title: 'Email enviado',
        content: r.previewUrl ? (
          <a href={r.previewUrl} target="_blank" rel="noreferrer">
            Ver email (Ethereal)
          </a>
        ) : (
          `Enviado a ${venta?.cliente?.email}`
        ),
      });
      await cargar();
    } catch (error) {
      message.error(obtenerMensajeError(error));
    } finally {
      setEnviando(false);
    }
  };

  if (!venta) return <Card loading />;

  return (
    <Card
      title={`Venta N° ${venta.id}`}
      extra={
        <Space wrap>
          <Button icon={<FilePdfOutlined />} href={ventasApi.urlPdf(venta.id)} target="_blank">
            PDF
          </Button>
          <Button icon={<MailOutlined />} loading={enviando} onClick={enviarEmail}>
            Enviar email
          </Button>
          <Button onClick={() => navigate('/ventas')}>Volver</Button>
        </Space>
      }
    >
      <Descriptions bordered size="small" column={{ xs: 1, md: 2 }}>
        <Descriptions.Item label="Fecha">{formatearFecha(venta.fechaCreacion)}</Descriptions.Item>
        <Descriptions.Item label="Estado">
          <Tag color={COLOR_ESTADO_VENTA[venta.estado]}>{ETIQUETA_ESTADO_VENTA[venta.estado]}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Cliente">
          {venta.cliente?.apellido}, {venta.cliente?.nombre} ({venta.cliente?.email})
        </Descriptions.Item>
        <Descriptions.Item label="Vendedor">
          {venta.usuario?.apellido}, {venta.usuario?.nombre}
        </Descriptions.Item>
        <Descriptions.Item label="Pago">
          {venta.modoPago === 'PLAN'
            ? `Plan ${venta.plan?.tarjeta?.nombre} / ${venta.plan?.banco?.nombre} — ${venta.cantidadCuotas} cuotas de ${formatearMoneda(venta.montoCuota)} (tasa ${venta.tasaFinanciacion}%)`
            : 'Contado'}
        </Descriptions.Item>
        <Descriptions.Item label="Entrega">
          {venta.tipoEntrega === 'RETIRO_SUCURSAL'
            ? `Retiro en ${venta.sucursal?.nombre}`
            : `Domicilio: ${venta.direccionEntrega}`}
        </Descriptions.Item>
        <Descriptions.Item label="Subtotal">{formatearMoneda(venta.subtotal)}</Descriptions.Item>
        <Descriptions.Item label="Total">
          <b>{formatearMoneda(venta.total)}</b>
        </Descriptions.Item>
        <Descriptions.Item label="Último email">{formatearFecha(venta.fechaUltimoEnvioEmail)}</Descriptions.Item>
        {venta.motivoCancelacion && (
          <Descriptions.Item label="Motivo de cancelación">{venta.motivoCancelacion}</Descriptions.Item>
        )}
      </Descriptions>

      <Table<DetalleVenta>
        style={{ marginTop: 16 }}
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={venta.detalles ?? []}
        columns={[
          { title: 'Producto', render: (_, d) => d.producto?.nombre },
          { title: 'Cantidad', dataIndex: 'cantidad' },
          { title: 'Precio unitario', render: (_, d) => formatearMoneda(d.precioUnitario) },
          { title: 'Subtotal', render: (_, d) => formatearMoneda(d.subtotal) },
        ]}
      />

      <Space style={{ marginTop: 16 }} wrap>
        {siguientesEstados(venta).map((estado) =>
          estado === 'CANCELADO' ? (
            <Button key={estado} danger onClick={() => setCancelando(true)}>
              Cancelar venta
            </Button>
          ) : (
            <Button key={estado} type="primary" onClick={() => cambiarEstado(estado)}>
              Pasar a: {ETIQUETA_ESTADO_VENTA[estado]}
            </Button>
          ),
        )}
      </Space>

      <Modal
        title="Cancelar venta"
        open={cancelando}
        okText="Confirmar cancelación"
        okButtonProps={{ danger: true, disabled: !motivo.trim() }}
        onCancel={() => setCancelando(false)}
        onOk={async () => {
          await cambiarEstado('CANCELADO', motivo.trim());
          setCancelando(false);
          setMotivo('');
        }}
      >
        <p>El stock de los productos vuelve a los depósitos. El motivo es obligatorio.</p>
        <Input.TextArea
          rows={3}
          maxLength={500}
          placeholder="Motivo de cancelación"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </Modal>
    </Card>
  );
}
