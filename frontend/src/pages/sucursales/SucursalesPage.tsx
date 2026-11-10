import { Form, Input } from 'antd';
import { sucursalesApi } from '../../api/sucursales.api';
import type { SucursalForm } from '../../api/sucursales.api';
import CrudPage from '../../components/CrudPage';
import UbicacionFields from '../../components/UbicacionFields';
import type { Sucursal } from '../../types';

export default function SucursalesPage() {
  return (
    <CrudPage<Sucursal, SucursalForm>
      titulo="Sucursales"
      api={sucursalesApi}
      columnas={[
        { title: 'ID', dataIndex: 'id', width: 70 },
        { title: 'Nombre', dataIndex: 'nombre' },
        { title: 'Provincia', render: (_, s) => s.provincia?.nombre },
        { title: 'Localidad', render: (_, s) => s.localidad?.nombre },
      ]}
      aFormulario={(s) => ({
        nombre: s.nombre,
        provinciaId: s.provinciaId,
        localidadId: s.localidadId,
      })}
      campos={
        <>
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, whitespace: true, message: 'Obligatorio' }]}
          >
            <Input />
          </Form.Item>
          <UbicacionFields />
        </>
      }
    />
  );
}
