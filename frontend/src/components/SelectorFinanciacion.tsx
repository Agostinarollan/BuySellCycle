import { Col, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { financiacionApi } from '../api/financiacion.api';
import { planesApi } from '../api/planes.api';
import { tarjetasApi } from '../api/tarjetas.api';
import type { Banco, Plan, Tarjeta } from '../types';

/**
 * Selección en cascada de la Guía 2: Tarjeta -> Banco -> Plan.
 * Cuando el usuario elige un plan, se lo avisa al padre con onChange(plan).
 */
export default function SelectorFinanciacion({
  onChange,
}: {
  onChange: (plan: Plan | null) => void;
}) {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [tarjetaId, setTarjetaId] = useState<number>();
  const [bancoId, setBancoId] = useState<number>();
  const [planId, setPlanId] = useState<number>();

  useEffect(() => {
    void tarjetasApi.listar().then(setTarjetas);
  }, []);

  const elegirTarjeta = async (id: number) => {
    setTarjetaId(id);
    setBancoId(undefined);
    setPlanId(undefined);
    setPlanes([]);
    onChange(null);
    setBancos(await financiacionApi.bancosPorTarjeta(id)); // paso 2
  };

  const elegirBanco = async (id: number) => {
    setBancoId(id);
    setPlanId(undefined);
    onChange(null);
    setPlanes(await planesApi.filtrar(tarjetaId!, id)); // paso 3
  };

  const elegirPlan = (id: number) => {
    setPlanId(id);
    onChange(planes.find((p) => p.id === id) ?? null);
  };

  return (
    <Row gutter={12}>
      <Col xs={24} md={8}>
        <label>1. Tarjeta</label>
        <Select
          style={{ width: '100%' }}
          value={tarjetaId}
          onChange={elegirTarjeta}
          placeholder="Tarjeta"
          options={tarjetas.map((t) => ({
            value: t.id,
            label: `${t.nombre} (${t.tipo === 'CREDITO' ? 'crédito' : 'débito'})`,
          }))}
        />
      </Col>
      <Col xs={24} md={8}>
        <label>2. Banco</label>
        <Select
          style={{ width: '100%' }}
          value={bancoId}
          onChange={elegirBanco}
          disabled={!tarjetaId}
          placeholder={tarjetaId && bancos.length === 0 ? 'Sin planes para esta tarjeta' : 'Banco'}
          options={bancos.map((b) => ({ value: b.id, label: b.nombre }))}
        />
      </Col>
      <Col xs={24} md={8}>
        <label>3. Plan</label>
        <Select
          style={{ width: '100%' }}
          value={planId}
          onChange={elegirPlan}
          disabled={!bancoId}
          placeholder="Plan"
          options={planes.map((p) => ({
            value: p.id,
            label: `${p.cantidadCuotas} cuotas - tasa ${p.tasaFinanciacion}%`,
          }))}
        />
      </Col>
    </Row>
  );
}
