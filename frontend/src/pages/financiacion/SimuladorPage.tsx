import { App, Button, Card, Descriptions, InputNumber, Space, Typography } from 'antd';
import { useState } from 'react';
import { financiacionApi } from '../../api/financiacion.api';
import { obtenerMensajeError } from '../../api/http';
import SelectorFinanciacion from '../../components/SelectorFinanciacion';
import type { Plan, Simulacion } from '../../types';
import { formatearMoneda } from '../../utils/formato';

export default function SimuladorPage() {
  const { message } = App.useApp();
  const [monto, setMonto] = useState<number | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [resultado, setResultado] = useState<Simulacion | null>(null);

  const simular = async () => {
    if (!monto || !plan) {
      message.warning('Ingresá un monto y elegí tarjeta, banco y plan');
      return;
    }
    try {
      setResultado(await financiacionApi.simular(monto, plan.id));
    } catch (error) {
      message.error(obtenerMensajeError(error));
    }
  };

  return (
    <Card title="Simular financiación">
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Typography.Text>Monto a financiar</Typography.Text>
          <br />
          <InputNumber
            min={0.01}
            precision={2}
            prefix="$"
            style={{ width: 240 }}
            value={monto}
            onChange={(v) => {
              setMonto(v);
              setResultado(null);
            }}
          />
        </div>
        <SelectorFinanciacion
          onChange={(p) => {
            setPlan(p);
            setResultado(null);
          }}
        />
        {plan?.observaciones && (
          <Typography.Text type="secondary">Observaciones del plan: {plan.observaciones}</Typography.Text>
        )}
        <Button type="primary" onClick={simular}>
          Simular
        </Button>
        {resultado && (
          <Descriptions bordered column={1} title="Resultado">
            <Descriptions.Item label="Monto">{formatearMoneda(resultado.monto)}</Descriptions.Item>
            <Descriptions.Item label="Tarjeta / Banco">
              {resultado.tarjeta} / {resultado.banco}
            </Descriptions.Item>
            <Descriptions.Item label="Tasa de financiación">{resultado.tasaFinanciacion}%</Descriptions.Item>
            <Descriptions.Item label="Costo total financiado">
              <b>{formatearMoneda(resultado.total)}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Cuotas">
              {resultado.cantidadCuotas} cuotas de <b>{formatearMoneda(resultado.montoCuota)}</b>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Space>
    </Card>
  );
}
