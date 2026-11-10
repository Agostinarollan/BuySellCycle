import { Form, Input, InputNumber, Select } from 'antd';
import { useEffect, useState } from 'react';
import { bancosApi } from '../../api/bancos.api';
import { planesApi } from '../../api/planes.api';
import type { PlanForm } from '../../api/planes.api';
import { tarjetasApi } from '../../api/tarjetas.api';
import CrudPage from '../../components/CrudPage';
import type { Banco, Plan, Tarjeta } from '../../types';

export default function PlanesPage() {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);

  useEffect(() => {
    void tarjetasApi.listar().then(setTarjetas);
    void bancosApi.listar().then(setBancos);
  }, []);

  return (
    <CrudPage<Plan, PlanForm>
      titulo="Planes de financiación"
      api={planesApi}
      columnas={[
        { title: 'Tarjeta', render: (_, p) => `${p.tarjeta?.nombre} (${p.tarjeta?.tipo})` },
        { title: 'Banco', render: (_, p) => p.banco?.nombre },
        { title: 'Cuotas', dataIndex: 'cantidadCuotas' },
        { title: 'Tasa %', render: (_, p) => `${p.tasaFinanciacion}%` },
        { title: 'Observaciones', dataIndex: 'observaciones' },
      ]}
      aFormulario={(p) => ({
        tarjetaId: p.tarjetaId,
        bancoId: p.bancoId,
        cantidadCuotas: p.cantidadCuotas,
        tasaFinanciacion: Number(p.tasaFinanciacion),
        observaciones: p.observaciones ?? undefined,
      })}
      campos={
        <>
          <Form.Item name="tarjetaId" label="Tarjeta" rules={[{ required: true, message: 'Obligatoria' }]}>
            <Select options={tarjetas.map((t) => ({ value: t.id, label: `${t.nombre} (${t.tipo})` }))} />
          </Form.Item>
          <Form.Item name="bancoId" label="Banco" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Select options={bancos.map((b) => ({ value: b.id, label: b.nombre }))} />
          </Form.Item>
          <Form.Item name="cantidadCuotas" label="Cantidad de cuotas" rules={[{ required: true, message: 'Obligatoria' }]}>
            <InputNumber min={1} max={72} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="tasaFinanciacion" label="Tasa de financiación %" rules={[{ required: true, message: 'Obligatoria' }]}>
            <InputNumber min={0} max={1000} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="observaciones" label="Observaciones">
            <Input.TextArea maxLength={500} rows={2} />
          </Form.Item>
        </>
      }
    />
  );
}
