import { Form, Input } from 'antd';
import { proveedoresApi } from '../../api/proveedores.api';
import type { ProveedorForm } from '../../api/proveedores.api';
import CrudPage from '../../components/CrudPage';
import type { Proveedor } from '../../types';

export default function ProveedoresPage() {
  return (
    <CrudPage<Proveedor, ProveedorForm>
      titulo="Proveedores"
      api={proveedoresApi}
      columnas={[
        { title: 'ID', dataIndex: 'id', width: 70 },
        { title: 'Razón social', dataIndex: 'razonSocial' },
        { title: 'CUIT', dataIndex: 'cuit' },
      ]}
      campos={
        <>
          <Form.Item
            name="razonSocial"
            label="Razón social"
            rules={[{ required: true, whitespace: true, message: 'Obligatoria' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="cuit"
            label="CUIT"
            rules={[
              { required: true, message: 'Obligatorio' },
              { pattern: /^\d{2}-\d{8}-\d$/, message: 'Formato: 20-12345678-9' },
            ]}
          >
            <Input placeholder="20-12345678-9" />
          </Form.Item>
        </>
      }
    />
  );
}
