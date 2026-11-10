import { CheckOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientesApi } from '../../api/clientes.api';
import { direccionesApi } from '../../api/direcciones.api';
import type { DireccionForm } from '../../api/direcciones.api';
import { obtenerMensajeError } from '../../api/http';
import type { Cliente, DireccionEntrega } from '../../types';

export default function DireccionesPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams(); // parámetro de la URL: /clientes/:id/direcciones
  const clienteId = Number(id);
  const [form] = Form.useForm<DireccionForm>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [direcciones, setDirecciones] = useState<DireccionEntrega[]>([]);
  const [editando, setEditando] = useState<DireccionEntrega | null>(null);
  const [textoEdicion, setTextoEdicion] = useState('');

  const cargar = useCallback(async () => {
    try {
      setCliente(await clientesApi.obtener(clienteId));
      setDirecciones(await direccionesApi.porCliente(clienteId));
    } catch (error) {
      message.error(obtenerMensajeError(error));
    }
  }, [clienteId, message]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Envuelve cualquier acción: ejecuta, muestra error si falla y recarga.
  const ejecutar = async (accion: () => Promise<unknown>, ok: string) => {
    try {
      await accion();
      message.success(ok);
      await cargar();
    } catch (error) {
      message.error(obtenerMensajeError(error));
    }
  };

  const agregar = async () => {
    let valores: DireccionForm;
    try {
      valores = await form.validateFields();
    } catch {
      return;
    }
    await ejecutar(() => direccionesApi.crear(clienteId, valores), 'Dirección agregada');
    form.resetFields();
  };

  return (
    <Card
      title={`Direcciones de entrega - ${cliente ? `${cliente.apellido}, ${cliente.nombre}` : ''}`}
      extra={<Button onClick={() => navigate('/clientes')}>Volver a clientes</Button>}
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item
          name="direccion"
          rules={[{ required: true, whitespace: true, message: 'Escribí la dirección' }]}
          style={{ flex: 1 }}
        >
          <Input placeholder="Calle, número, piso, localidad..." maxLength={255} />
        </Form.Item>
        <Form.Item name="esPrincipal" valuePropName="checked">
          <Checkbox>Principal</Checkbox>
        </Form.Item>
        <Button type="primary" onClick={agregar}>
          Agregar
        </Button>
      </Form>

      <Table<DireccionEntrega>
        rowKey="id"
        pagination={false}
        dataSource={direcciones}
        locale={{ emptyText: 'El cliente no tiene direcciones cargadas' }}
        columns={[
          {
            title: 'Dirección',
            render: (_, d) => (
              <Space>
                {d.direccion}
                {d.esPrincipal && <Tag color="gold">Principal</Tag>}
              </Space>
            ),
          },
          {
            title: 'Acciones',
            width: 1,
            render: (_, d) => (
              <Space>
                {!d.esPrincipal && (
                  <Tooltip title="Marcar como principal">
                    <Button
                      icon={<CheckOutlined />}
                      onClick={() =>
                        ejecutar(
                          () => direccionesApi.marcarPrincipal(d.id),
                          'Dirección principal actualizada',
                        )
                      }
                    />
                  </Tooltip>
                )}
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditando(d);
                    setTextoEdicion(d.direccion);
                  }}
                />
                <Popconfirm
                  title="¿Archivar dirección?"
                  onConfirm={() =>
                    ejecutar(() => direccionesApi.eliminar(d.id), 'Dirección archivada')
                  }
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="Editar dirección"
        open={editando !== null}
        onCancel={() => setEditando(null)}
        onOk={async () => {
          if (!editando || !textoEdicion.trim()) return;
          await ejecutar(
            () => direccionesApi.actualizar(editando.id, { direccion: textoEdicion.trim() }),
            'Dirección actualizada',
          );
          setEditando(null);
        }}
      >
        <Input value={textoEdicion} maxLength={255} onChange={(e) => setTextoEdicion(e.target.value)} />
      </Modal>
    </Card>
  );
}
