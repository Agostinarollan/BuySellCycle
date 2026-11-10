import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Select, Space, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ventasApi } from '../../api/ventas.api';
import type { EstadoVenta, Venta } from '../../types';
import {
  COLOR_ESTADO_VENTA,
  ETIQUETA_ESTADO_VENTA,
  formatearFecha,
  formatearMoneda,
} from '../../utils/formato';

export default function VentasPage() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<EstadoVenta | undefined>();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setCargando(true);
    ventasApi
      .listar(estado)
      .then(setVentas)
      .finally(() => setCargando(false));
  }, [estado]);

  return (
    <Card
      title="Ventas"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/ventas/nueva')}>
          Nueva venta
        </Button>
      }
    >
      {/* Fila de filtros */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear
          placeholder="Filtrar por estado"
          style={{ width: 240 }}
          value={estado}
          onChange={setEstado}
          options={Object.entries(ETIQUETA_ESTADO_VENTA).map(([value, label]) => ({ value, label }))}
        />
      </Space>
      <Table<Venta>
        rowKey="id"
        loading={cargando}
        dataSource={ventas}
        scroll={{ x: true }}
        columns={[
          { title: 'N°', dataIndex: 'id', width: 60 },
          { title: 'Fecha', render: (_, v) => formatearFecha(v.fechaCreacion) },
          { title: 'Cliente', render: (_, v) => `${v.cliente?.apellido}, ${v.cliente?.nombre}` },
          { title: 'Pago', render: (_, v) => (v.modoPago === 'PLAN' ? `Plan ${v.cantidadCuotas} cuotas` : 'Contado') },
          { title: 'Entrega', render: (_, v) => (v.tipoEntrega === 'DOMICILIO' ? 'Domicilio' : 'Retiro sucursal') },
          { title: 'Total', render: (_, v) => formatearMoneda(v.total) },
          {
            title: 'Estado',
            render: (_, v) => <Tag color={COLOR_ESTADO_VENTA[v.estado]}>{ETIQUETA_ESTADO_VENTA[v.estado]}</Tag>,
          },
          {
            title: '',
            render: (_, v) => <Button icon={<EyeOutlined />} onClick={() => navigate(`/ventas/${v.id}`)} />,
          },
        ]}
      />
    </Card>
  );
}
