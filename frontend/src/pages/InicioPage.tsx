import {
  BugOutlined,
  CalculatorOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  InboxOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Row, Space, Statistic, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { erroresApi } from '../api/errores.api';
import { productosApi } from '../api/productos.api';
import { ventasApi } from '../api/ventas.api';
import { useSesionStore } from '../store/sesion.store';

/** Una tarjeta del tablero: título, ícono, valor (null = no disponible) y destino. */
function Indicador(props: {
  titulo: string;
  icono: ReactNode;
  valor: number | null | undefined; // undefined = cargando
  color: string;
  ruta?: string;
  ayuda?: string;
}) {
  const navigate = useNavigate();
  return (
    <Card
      hoverable={!!props.ruta}
      onClick={props.ruta ? () => navigate(props.ruta!) : undefined}
    >
      <Statistic
        title={props.titulo}
        value={props.valor ?? '—'}
        loading={props.valor === undefined}
        prefix={props.icono}
        valueStyle={{ color: props.color }}
      />
      {props.ayuda && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {props.ayuda}
        </Typography.Text>
      )}
    </Card>
  );
}

export default function InicioPage() {
  const navigate = useNavigate();
  const usuario = useSesionStore((s) => s.usuario);
  const esAdmin = usuario?.rol === 'ADMINISTRACION';

  // undefined = cargando; null = no se pudo obtener (se muestra "—")
  const [ventasHoy, setVentasHoy] = useState<number | null>();
  const [enPreparacion, setEnPreparacion] = useState<number | null>();
  const [sinStock, setSinStock] = useState<number | null>();
  const [errores24h, setErrores24h] = useState<number | null>();

  useEffect(() => {
    if (!usuario) return;
    // Todo se calcula con endpoints que ya existen; cada tarjeta es
    // independiente: si una falla, las demás se muestran igual.
    ventasApi
      .listar()
      .then((vs) => setVentasHoy(vs.filter((v) => dayjs(v.fechaCreacion).isSame(dayjs(), 'day')).length))
      .catch(() => setVentasHoy(null));
    ventasApi
      .listar('EN_PREPARACION')
      .then((vs) => setEnPreparacion(vs.length))
      .catch(() => setEnPreparacion(null));
    if (esAdmin) {
      productosApi
        .listar()
        .then((ps) => setSinStock(ps.filter((p) => p.stockTotal === 0).length))
        .catch(() => setSinStock(null));
      // Requiere los emuladores de Firebase; si están apagados muestra "—".
      erroresApi
        .listar()
        .then((es) => setErrores24h(es.filter((e) => dayjs(e.fecha).isAfter(dayjs().subtract(24, 'hour'))).length))
        .catch(() => setErrores24h(null));
    }
  }, [usuario, esAdmin]);

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {usuario ? `Hola, ${usuario.nombre}` : 'BuySellCycle S.R.L.'}
          </Typography.Title>
          {!usuario && (
            <Alert
              type="info"
              showIcon
              title="Elegí con qué usuario trabajar en el selector de arriba a la derecha para ver el menú y el tablero."
            />
          )}
          <Space wrap>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/ventas/nueva')}>
              Nueva venta
            </Button>
            <Button size="large" icon={<FileTextOutlined />} onClick={() => navigate('/presupuestos/nuevo')}>
              Nuevo presupuesto
            </Button>
            <Button size="large" icon={<CalculatorOutlined />} onClick={() => navigate('/simulador')}>
              Simular financiación
            </Button>
          </Space>
        </Space>
      </Card>

      {usuario && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <Indicador
              titulo="Ventas de hoy"
              icono={<ShoppingCartOutlined />}
              valor={ventasHoy}
              color="#1677ff"
              ruta="/ventas"
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Indicador
              titulo="Ventas en preparación"
              icono={<ClockCircleOutlined />}
              valor={enPreparacion}
              color="#d48806"
              ruta="/ventas"
            />
          </Col>
          {esAdmin && (
            <>
              <Col xs={24} sm={12} xl={6}>
                <Indicador
                  titulo="Productos con stock 0"
                  icono={<InboxOutlined />}
                  valor={sinStock}
                  color="#cf1322"
                  ruta="/productos"
                />
              </Col>
              <Col xs={24} sm={12} xl={6}>
                <Indicador
                  titulo="Errores (últimas 24 h)"
                  icono={<BugOutlined />}
                  valor={errores24h}
                  color="#722ed1"
                  ruta="/errores"
                  ayuda={errores24h === null ? 'Emuladores de Firebase apagados' : undefined}
                />
              </Col>
            </>
          )}
        </Row>
      )}
    </Space>
  );
}
