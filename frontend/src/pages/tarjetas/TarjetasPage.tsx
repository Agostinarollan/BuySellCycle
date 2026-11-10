import { Form, Image, Input, Select, Tag } from 'antd';
import { useState } from 'react';
import { tarjetasApi } from '../../api/tarjetas.api';
import type { TarjetaForm } from '../../api/tarjetas.api';
import CrudPage from '../../components/CrudPage';
import ImagenUpload from '../../components/ImagenUpload';
import type { Tarjeta } from '../../types';

export default function TarjetasPage() {
  const [version, setVersion] = useState(0);

  return (
    <CrudPage<Tarjeta, TarjetaForm>
      titulo="Tarjetas"
      api={tarjetasApi}
      version={version}
      columnas={[
        {
          title: 'Imagen',
          width: 90,
          render: (_, t) =>
            t.rutaImagen ? <Image src={tarjetasApi.urlImagen(t)} width={64} /> : '-',
        },
        { title: 'Nombre', dataIndex: 'nombre' },
        {
          title: 'Tipo',
          render: (_, t) => (
            <Tag color={t.tipo === 'CREDITO' ? 'blue' : 'green'}>
              {t.tipo === 'CREDITO' ? 'Crédito' : 'Débito'}
            </Tag>
          ),
        },
      ]}
      aFormulario={(t) => ({ nombre: t.nombre, tipo: t.tipo })}
      accionesExtra={(t) => (
        <ImagenUpload
          subir={(archivo) => tarjetasApi.subirImagen(t.id, archivo)}
          alTerminar={() => setVersion((v) => v + 1)}
        />
      )}
      campos={
        <>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, whitespace: true, message: 'Obligatorio' }]}>
            <Input placeholder="Ej: Visa" />
          </Form.Item>
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'Elegí el tipo' }]}>
            <Select
              options={[
                { value: 'CREDITO', label: 'Crédito' },
                { value: 'DEBITO', label: 'Débito' },
              ]}
            />
          </Form.Item>
        </>
      }
    />
  );
}
