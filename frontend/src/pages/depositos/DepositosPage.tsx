import { Form, Input } from 'antd';
import { depositosApi } from '../../api/depositos.api';
import type { DepositoForm } from '../../api/depositos.api';
import CrudPage from '../../components/CrudPage';
import UbicacionFields from '../../components/UbicacionFields';
import type { Deposito } from '../../types';

export default function DepositosPage() {
  return (
    <CrudPage<Deposito, DepositoForm>
      titulo="Depósitos"
      api={depositosApi}
      columnas={[
        { title: 'Código', dataIndex: 'codigo', width: 100 },
        { title: 'Nombre', dataIndex: 'nombre' },
        { title: 'Provincia', render: (_, d) => d.provincia?.nombre },
        { title: 'Localidad', render: (_, d) => d.localidad?.nombre },
      ]}
      aFormulario={(d) => ({
        nombre: d.nombre,
        provinciaId: d.provinciaId,
        localidadId: d.localidadId,
      })}
      campos={
        <>
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, whitespace: true, message: 'Obligatorio' }]}
          >
            <Input placeholder="Ej: Depósito Central" />
          </Form.Item>
          {/* El código DEP-XX lo genera el backend automáticamente */}
          <UbicacionFields />
        </>
      }
    />
  );
}
