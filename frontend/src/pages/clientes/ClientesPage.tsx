import { EnvironmentOutlined } from '@ant-design/icons';
import { Button, Form, Input, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { clientesApi } from '../../api/clientes.api';
import type { ClienteForm } from '../../api/clientes.api';
import CrudPage from '../../components/CrudPage';
import UbicacionFields from '../../components/UbicacionFields';
import type { Cliente } from '../../types';

export default function ClientesPage() {
  const navigate = useNavigate(); // navegar por código (sin <Link>)

  return (
    <CrudPage<Cliente, ClienteForm>
      titulo="Clientes"
      api={clientesApi}
      columnas={[
        { title: 'Apellido y nombre', render: (_, c) => `${c.apellido}, ${c.nombre}` },
        { title: 'DNI', dataIndex: 'dni' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Localidad', render: (_, c) => `${c.localidad?.nombre ?? ''} (${c.provincia?.nombre ?? ''})` },
        {
          title: 'Dirección principal',
          render: (_, c) => c.direcciones?.find((d) => d.esPrincipal)?.direccion ?? '-',
        },
      ]}
      aFormulario={(c) => ({
        nombre: c.nombre,
        apellido: c.apellido,
        dni: c.dni,
        email: c.email,
        provinciaId: c.provinciaId,
        localidadId: c.localidadId,
      })}
      accionesExtra={(c) => (
        <Tooltip title="Direcciones de entrega">
          <Button
            icon={<EnvironmentOutlined />}
            onClick={() => navigate(`/clientes/${c.id}/direcciones`)}
          />
        </Tooltip>
      )}
      campos={
        <>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, whitespace: true, message: 'Obligatorio' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="apellido" label="Apellido" rules={[{ required: true, whitespace: true, message: 'Obligatorio' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="dni"
            label="DNI"
            rules={[
              { required: true, message: 'Obligatorio' },
              { pattern: /^\d{7,8}$/, message: '7 u 8 dígitos, sin puntos' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Obligatorio' },
              { type: 'email', message: 'Email inválido' },
            ]}
          >
            <Input />
          </Form.Item>
          <UbicacionFields />
        </>
      }
    />
  );
}
