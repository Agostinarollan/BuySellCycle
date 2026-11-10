import { ReloadOutlined } from '@ant-design/icons';
import { App, Button, Card, Segmented, Space, Table, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { erroresApi } from '../../api/errores.api';
import { obtenerMensajeError } from '../../api/http';
import type { RegistroError, TipoSistema } from '../../types';
import { formatearFecha } from '../../utils/formato';

type Filtro = 'todos' | TipoSistema;

export default function ErroresPage() {
  const { message } = App.useApp();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [errores, setErrores] = useState<RegistroError[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setErrores(await erroresApi.listar(filtro === 'todos' ? undefined : filtro));
    } catch (error) {
      message.error(obtenerMensajeError(error));
    } finally {
      setCargando(false);
    }
  }, [filtro, message]);

  // Se vuelve a ejecutar cada vez que cambia el filtro
  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Botones para PROBAR la captura de errores del frontend
  const errorEnEvento = () => {
    throw new Error('Error de prueba lanzado desde un botón');
  };
  const errorEnPromesa = () => {
    void Promise.reject(new Error('Promesa rechazada de prueba'));
  };

  return (
    <Card
      title="Errores registrados (Firestore)"
      extra={
        <Space wrap>
          <Button onClick={errorEnEvento}>Provocar error (evento)</Button>
          <Button onClick={errorEnPromesa}>Provocar error (promesa)</Button>
          <Button icon={<ReloadOutlined />} onClick={cargar}>
            Actualizar
          </Button>
        </Space>
      }
    >
      <Segmented<Filtro>
        style={{ marginBottom: 16 }}
        value={filtro}
        onChange={setFiltro}
        options={[
          { value: 'todos', label: 'Todos' },
          { value: 'frontend', label: 'Frontend' },
          { value: 'backend', label: 'Backend' },
        ]}
      />
      <Table<RegistroError>
        rowKey="id"
        loading={cargando}
        dataSource={errores}
        scroll={{ x: true }}
        columns={[
          { title: 'Fecha', render: (_, e) => formatearFecha(e.fecha), width: 150 },
          {
            title: 'Sistema',
            render: (_, e) => (
              <Tag color={e.tipoSistema === 'frontend' ? 'purple' : 'volcano'}>{e.tipoSistema}</Tag>
            ),
          },
          { title: 'Tipo', dataIndex: 'nombre' },
          { title: 'Mensaje', dataIndex: 'mensaje' },
          { title: 'HTTP', render: (_, e) => e.statusCode ?? '-' },
          { title: 'Método', render: (_, e) => e.metodo ?? '-' },
          { title: 'Ruta / pantalla', render: (_, e) => e.ruta ?? '-' },
        ]}
        // Fila expandible: muestra el stack y el contexto completos
        expandable={{
          expandedRowRender: (e) => (
            <>
              <Typography.Text strong>Stack</Typography.Text>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>{e.stack ?? '-'}</pre>
              <Typography.Text strong>Contexto</Typography.Text>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>
                {JSON.stringify(e.contexto, null, 2)}
              </pre>
              <Typography.Text type="secondary">{e.userAgent}</Typography.Text>
            </>
          ),
        }}
      />
    </Card>
  );
}
