import { Form, Input, Select, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { sucursalesApi } from '../../api/sucursales.api';
import { usuariosApi } from '../../api/usuarios.api';
import type { UsuarioForm } from '../../api/usuarios.api';
import CrudPage from '../../components/CrudPage';
import type { Sucursal, Usuario } from '../../types';

export default function UsuariosPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  useEffect(() => {
    void sucursalesApi.listar().then(setSucursales);
  }, []);

  return (
    <CrudPage<Usuario, UsuarioForm>
      titulo="Usuarios"
      api={usuariosApi}
      columnas={[
        { title: 'Usuario', dataIndex: 'nombreUsuario' },
        { title: 'Apellido y nombre', render: (_, u) => `${u.apellido}, ${u.nombre}` },
        { title: 'DNI', dataIndex: 'dni' },
        {
          title: 'Rol',
          dataIndex: 'rol',
          render: (rol: string) => (
            <Tag color={rol === 'ADMINISTRACION' ? 'purple' : 'blue'}>{rol}</Tag>
          ),
        },
        { title: 'Sucursal', render: (_, u) => u.sucursal?.nombre },
      ]}
      aFormulario={(u) => ({
        nombre: u.nombre,
        apellido: u.apellido,
        dni: u.dni,
        nombreUsuario: u.nombreUsuario,
        rol: u.rol,
        sucursalId: u.sucursalId,
      })}
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
            name="nombreUsuario"
            label="Nombre de usuario"
            rules={[
              { required: true, message: 'Obligatorio' },
              { min: 4, message: 'Mínimo 4 caracteres' },
              { pattern: /^[a-zA-Z0-9._]+$/, message: 'Solo letras, números, punto y guion bajo' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="rol" label="Rol" rules={[{ required: true, message: 'Elegí un rol' }]}>
            <Select
              options={[
                { value: 'ADMINISTRACION', label: 'Administración' },
                { value: 'VENDEDOR', label: 'Vendedor' },
              ]}
            />
          </Form.Item>
          <Form.Item name="sucursalId" label="Sucursal" rules={[{ required: true, message: 'Elegí una sucursal' }]}>
            <Select options={sucursales.map((s) => ({ value: s.id, label: s.nombre }))} />
          </Form.Item>
        </>
      }
    />
  );
}
