import { Form, Input } from 'antd';
import { bancosApi } from '../../api/bancos.api';
import type { BancoForm } from '../../api/bancos.api';
import CrudPage from '../../components/CrudPage';
import type { Banco } from '../../types';

export default function BancosPage() {
  return (
    <CrudPage<Banco, BancoForm>
      titulo="Bancos"
      api={bancosApi}
      columnas={[
        { title: 'ID', dataIndex: 'id', width: 70 },
        { title: 'Nombre', dataIndex: 'nombre' },
      ]}
      campos={
        <Form.Item name="nombre" label="Nombre" rules={[{ required: true, whitespace: true, message: 'Obligatorio' }]}>
          <Input placeholder="Ej: Banco Galicia" />
        </Form.Item>
      }
    />
  );
}
