import { FilePdfOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Popconfirm, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerMensajeError } from '../../api/http';
import { presupuestosApi } from '../../api/presupuestos.api';
import type { Presupuesto } from '../../types';
import {
  formatearFecha,
  formatearMoneda,
  formatearSoloFecha,
} from '../../utils/formato';

export default function PresupuestosPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setPresupuestos(await presupuestosApi.listar());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const archivar = async (id: number) => {
    try {
      await presupuestosApi.eliminar(id);
      await cargar();
    } catch (error) {
      message.error(obtenerMensajeError(error));
    }
  };

  return (
    <Card
      title="Presupuestos"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/presupuestos/nuevo')}>
          Nuevo presupuesto
        </Button>
      }
    >
      <Table<Presupuesto>
        rowKey="id"
        loading={cargando}
        dataSource={presupuestos}
        columns={[
          { title: 'N°', dataIndex: 'id', width: 60 },
          { title: 'Fecha', render: (_, p) => formatearFecha(p.fechaCreacion) },
          { title: 'Cliente', render: (_, p) => `${p.cliente?.apellido}, ${p.cliente?.nombre}` },
          {
            title: 'Vence',
            render: (_, p) => {
              // dayjs: comparar fechas es muy simple
              const vencido = dayjs(p.fechaVencimiento).isBefore(dayjs());
              return (
                <Tag color={vencido ? 'red' : 'green'}>
                  {formatearSoloFecha(p.fechaVencimiento)}
                  {vencido ? ' (vencido)' : ''}
                </Tag>
              );
            },
          },
          { title: 'Total contado', render: (_, p) => formatearMoneda(p.totalContado) },
          { title: 'Total lista', render: (_, p) => formatearMoneda(p.totalLista) },
          {
            title: 'Acciones',
            render: (_, p) => (
              <Space>
                <Button icon={<FilePdfOutlined />} href={presupuestosApi.urlPdf(p.id)} target="_blank">
                  PDF
                </Button>
                <Popconfirm title="¿Archivar presupuesto?" onConfirm={() => archivar(p.id)}>
                  <Button danger>Archivar</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}
