import { Form, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useCatalogosStore } from '../store/catalogos.store';
import type { Localidad } from '../types';

/**
 * Par de selects dependientes Provincia -> Localidad.
 * Se usa DENTRO de un <Form> (Depósito, Sucursal, Cliente).
 */
export default function UbicacionFields() {
  const form = Form.useFormInstance();
  // useWatch: "escucha" el valor del campo provinciaId del formulario.
  const provinciaId = Form.useWatch<number | undefined>('provinciaId', form);

  // Zustand: tomamos del store global solo lo que necesitamos.
  const provincias = useCatalogosStore((s) => s.provincias);
  const cargarProvincias = useCatalogosStore((s) => s.cargarProvincias);
  const cargarLocalidades = useCatalogosStore((s) => s.cargarLocalidades);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);

  useEffect(() => {
    void cargarProvincias();
  }, [cargarProvincias]);

  // Cada vez que cambia la provincia, pedimos sus localidades.
  useEffect(() => {
    if (!provinciaId) {
      setLocalidades([]);
      return;
    }
    void cargarLocalidades(provinciaId).then(setLocalidades);
  }, [provinciaId, cargarLocalidades]);

  return (
    <>
      <Form.Item
        name="provinciaId"
        label="Provincia"
        rules={[{ required: true, message: 'Elegí una provincia' }]}
      >
        <Select
          showSearch={{ optionFilterProp: 'label' }}
          placeholder="Provincia"
          options={provincias.map((p) => ({ value: p.id, label: p.nombre }))}
          // Si cambia la provincia, la localidad anterior ya no sirve.
          onChange={() => form.setFieldValue('localidadId', undefined)}
        />
      </Form.Item>
      <Form.Item
        name="localidadId"
        label="Localidad"
        rules={[{ required: true, message: 'Elegí una localidad' }]}
      >
        <Select
          showSearch={{ optionFilterProp: 'label' }}
          placeholder={provinciaId ? 'Localidad' : 'Primero elegí la provincia'}
          disabled={!provinciaId}
          options={localidades.map((l) => ({ value: l.id, label: l.nombre }))}
        />
      </Form.Item>
    </>
  );
}
