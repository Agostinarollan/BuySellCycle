import { Form, Input } from 'antd';
import { marcasApi } from '../../api/marcas.api';
import CrudPage from '../../components/CrudPage';
import type { Marca } from '../../types';
import { formatearFecha } from '../../utils/formato';

export default function MarcasPage() {
  return (
    <CrudPage<Marca, { nombre: string }>
      titulo="Marcas"
      api={marcasApi}
      columnas={[
        { title: 'ID', dataIndex: 'id', width: 70 },
        { title: 'Nombre', dataIndex: 'nombre' },
        {
          title: 'Creada',
          dataIndex: 'fechaCreacion',
          render: (valor: string) => formatearFecha(valor),
        },
      ]}
      campos={
        <Form.Item
          name="nombre"
          label="Nombre"
          rules={[
            { required: true, whitespace: true, message: 'El nombre es obligatorio' },
            { max: 100, message: 'Máximo 100 caracteres' },
          ]}
        >
          <Input placeholder="Ej: Samsung" />
        </Form.Item>
      }
    />
  );
}
