import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ApiCrud } from '../api/crud.api';
import { obtenerMensajeError } from '../api/http';

/**
 * Texto "buscable" de un registro: junta todos sus valores de texto y
 * números, incluidos los de relaciones (ej. provincia.nombre). Solo filtra
 * lo que ya está en pantalla: no hace peticiones al backend.
 */
function textoBuscable(valor: unknown, profundidad = 0): string {
  if (valor === null || valor === undefined || profundidad > 2) return '';
  if (typeof valor === 'string' || typeof valor === 'number') return String(valor);
  if (Array.isArray(valor)) return valor.map((v) => textoBuscable(v, profundidad + 1)).join(' ');
  if (typeof valor === 'object')
    return Object.values(valor).map((v) => textoBuscable(v, profundidad + 1)).join(' ');
  return '';
}

const normalizar = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Componente GENÉRICO de ABM (Alta, Baja, Modificación).
 * Recibe por PROPS todo lo que cambia entre entidades: título, api,
 * columnas de la tabla y campos del formulario.
 */
interface CrudPageProps<T extends { id: number }, D> {
  titulo: string;
  api: ApiCrud<T, D>;
  columnas: TableColumnsType<T>;
  campos: ReactNode; // los <Form.Item> del formulario
  aFormulario?: (registro: T) => Partial<D>; // registro -> valores del form
  accionesExtra?: (registro: T) => ReactNode;
  version?: number; // si el padre cambia este número, la tabla se recarga
  extraCabecera?: ReactNode; // botones adicionales junto a "+ Nuevo"
}

export default function CrudPage<T extends { id: number }, D extends object>({
  titulo,
  api,
  columnas,
  campos,
  aFormulario,
  accionesExtra,
  version = 0,
  extraCabecera,
}: CrudPageProps<T, D>) {
  const { message } = App.useApp();
  const [form] = Form.useForm<D>();

  // ---------------- ESTADO (useState) ----------------
  const [registros, setRegistros] = useState<T[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<T | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return registros;
    return registros.filter((r) => normalizar(textoBuscable(r)).includes(q));
  }, [registros, busqueda]);

  // useCallback: la función no se recrea en cada render (la usa useEffect).
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setRegistros(await api.listar());
    } catch (error) {
      message.error(obtenerMensajeError(error));
    } finally {
      setCargando(false);
    }
  }, [api, message]);

  // useEffect: se ejecuta después del primer render -> carga la tabla.
  useEffect(() => {
    void cargar();
  }, [cargar, version]);

  const abrirNuevo = () => {
    setEditando(null);
    form.resetFields();
    setModalAbierto(true);
  };

  const abrirEdicion = (registro: T) => {
    setEditando(registro);
    form.resetFields();
    form.setFieldsValue(
      (aFormulario ? aFormulario(registro) : registro) as Parameters<
        typeof form.setFieldsValue
      >[0],
    );
    setModalAbierto(true);
  };

  const guardar = async () => {
    let valores: D;
    try {
      valores = await form.validateFields(); // validación del FRONTEND
    } catch {
      return; // hay campos inválidos: antd ya los muestra en rojo
    }
    setGuardando(true);
    try {
      if (editando) {
        await api.actualizar(editando.id, valores);
        message.success('Registro actualizado');
      } else {
        await api.crear(valores);
        message.success('Registro creado');
      }
      setModalAbierto(false);
      await cargar();
    } catch (error) {
      // Errores del BACKEND (validación de DTO, duplicados, reglas...)
      message.error(obtenerMensajeError(error));
    } finally {
      setGuardando(false);
    }
  };

  const archivar = async (registro: T) => {
    try {
      await api.eliminar(registro.id);
      message.success('Registro archivado');
      await cargar();
    } catch (error) {
      message.error(obtenerMensajeError(error));
    }
  };

  const columnasConAcciones: TableColumnsType<T> = [
    ...columnas,
    {
      title: 'Acciones',
      key: 'acciones',
      width: 1,
      render: (_: unknown, registro: T) => (
        <Space>
          {accionesExtra?.(registro)}
          <Tooltip title="Editar">
            <Button icon={<EditOutlined />} onClick={() => abrirEdicion(registro)} />
          </Tooltip>
          <Popconfirm
            title="¿Archivar este registro?"
            okText="Sí"
            cancelText="No"
            onConfirm={() => archivar(registro)}
          >
            <Tooltip title="Archivar">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={titulo}
      extra={
        <Space wrap>
          {extraCabecera}
          <Button type="primary" icon={<PlusOutlined />} onClick={abrirNuevo}>
            Nuevo
          </Button>
        </Space>
      }
    >
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Buscar…"
          style={{ width: 280 }}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Typography.Text type="secondary">
          {filtrados.length} de {registros.length} registros
        </Typography.Text>
      </Space>
      <Table<T>
        rowKey="id"
        loading={cargando}
        dataSource={filtrados}
        columns={columnasConAcciones}
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
      <Modal
        title={editando ? `Editar ${titulo}` : `Nuevo registro - ${titulo}`}
        open={modalAbierto}
        onOk={guardar}
        onCancel={() => setModalAbierto(false)}
        confirmLoading={guardando}
        okText="Guardar"
        cancelText="Cancelar"
        forceRender
      >
        <Form form={form} layout="vertical">
          {campos}
        </Form>
      </Modal>
    </Card>
  );
}
