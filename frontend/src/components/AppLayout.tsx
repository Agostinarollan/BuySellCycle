import {
  ApartmentOutlined,
  AppstoreOutlined,
  BankOutlined,
  BugOutlined,
  CalculatorOutlined,
  CreditCardOutlined,
  DatabaseOutlined,
  DollarOutlined,
  FileTextOutlined,
  HomeOutlined,
  IdcardOutlined,
  InboxOutlined,
  LogoutOutlined,
  PlusCircleOutlined,
  ScheduleOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  SwapOutlined,
  TagsOutlined,
  TeamOutlined,
  TruckOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Breadcrumb,
  Button,
  Layout,
  Menu,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usuariosApi } from '../api/usuarios.api';
import { useSesionStore } from '../store/sesion.store';
import type { RolUsuario, Usuario } from '../types';

const { Sider, Content, Header } = Layout;

// ------------------------------------------------------------------
// Definición del menú. `roles` es opcional: si no está, lo ven todos.
// "Administracion" ve todo; "Vendedor" solo lo que lo incluye.
// ------------------------------------------------------------------
const ADMIN: RolUsuario[] = ['ADMINISTRACION'];

interface ItemMenu {
  key: string; // en las hojas es la ruta; en los grupos un id
  label: string;
  icon: ReactNode;
  roles?: RolUsuario[];
  children?: ItemMenu[];
}

const MENU: ItemMenu[] = [
  { key: '/', label: 'Inicio', icon: <HomeOutlined /> },
  {
    key: 'grp-ventas',
    label: 'Ventas',
    icon: <ShoppingCartOutlined />,
    children: [
      { key: '/ventas/nueva', label: 'Nueva venta', icon: <PlusCircleOutlined /> },
      { key: '/ventas', label: 'Listado de ventas', icon: <UnorderedListOutlined /> },
      { key: '/presupuestos', label: 'Presupuestos', icon: <FileTextOutlined /> },
      { key: '/simulador', label: 'Simular financiación', icon: <CalculatorOutlined /> },
    ],
  },
  {
    key: 'grp-catalogo',
    label: 'Catálogo',
    icon: <AppstoreOutlined />,
    roles: ADMIN,
    children: [
      { key: '/productos', label: 'Productos', icon: <ShoppingOutlined /> },
      { key: '/marcas', label: 'Marcas', icon: <TagsOutlined /> },
      { key: '/categorias', label: 'Categorías', icon: <ApartmentOutlined /> },
    ],
  },
  {
    key: 'grp-inventario',
    label: 'Inventario',
    icon: <InboxOutlined />,
    roles: ADMIN,
    children: [
      { key: '/stock', label: 'Movimientos de stock', icon: <SwapOutlined /> },
      { key: '/depositos', label: 'Depósitos', icon: <DatabaseOutlined /> },
    ],
  },
  {
    key: 'grp-personas',
    label: 'Personas',
    icon: <TeamOutlined />,
    children: [
      { key: '/clientes', label: 'Clientes', icon: <UserOutlined /> },
      { key: '/proveedores', label: 'Proveedores', icon: <TruckOutlined />, roles: ADMIN },
      { key: '/usuarios', label: 'Usuarios', icon: <IdcardOutlined />, roles: ADMIN },
    ],
  },
  {
    key: 'grp-financiacion',
    label: 'Financiación',
    icon: <DollarOutlined />,
    roles: ADMIN,
    children: [
      { key: '/tarjetas', label: 'Tarjetas', icon: <CreditCardOutlined /> },
      { key: '/bancos', label: 'Bancos', icon: <BankOutlined /> },
      { key: '/planes', label: 'Planes', icon: <ScheduleOutlined /> },
    ],
  },
  {
    key: 'grp-sistema',
    label: 'Sistema',
    icon: <SettingOutlined />,
    roles: ADMIN,
    children: [
      { key: '/sucursales', label: 'Sucursales', icon: <ShopOutlined /> },
      { key: '/errores', label: 'Errores', icon: <BugOutlined /> },
    ],
  },
];

/**
 * Filtra el menú según el rol. Sin sesión solo se ve "Inicio"
 * (desde el header se elige con qué usuario trabajar).
 * Los grupos que quedan sin hijos se eliminan.
 */
function filtrarPorRol(items: ItemMenu[], rol: RolUsuario | null): ItemMenu[] {
  if (!rol) return items.filter((i) => i.key === '/');
  return items
    .filter((i) => !i.roles || i.roles.includes(rol))
    .map((i) =>
      i.children ? { ...i, children: filtrarPorRol(i.children, rol) } : i,
    )
    .filter((i) => !i.children || i.children.length > 0);
}

/** Convierte nuestra definición al formato de items de Ant Design. */
function aItemsAntd(items: ItemMenu[]): MenuProps['items'] {
  return items.map((i) =>
    i.children
      ? { key: i.key, icon: i.icon, label: i.label, children: aItemsAntd(i.children) }
      : { key: i.key, icon: i.icon, label: <Link to={i.key}>{i.label}</Link> },
  );
}

/**
 * Busca la hoja del menú que corresponde a la ruta actual: la de ruta más
 * larga que sea prefijo (ej. /ventas/3 -> /ventas, /ventas/nueva -> /ventas/nueva).
 */
function buscarActual(pathname: string) {
  let mejor: { item: ItemMenu; grupo: ItemMenu | null } | null = null;
  const revisar = (item: ItemMenu, grupo: ItemMenu | null) => {
    const coincide =
      item.key === '/'
        ? pathname === '/'
        : pathname === item.key || pathname.startsWith(item.key + '/');
    if (coincide && (!mejor || item.key.length > mejor.item.key.length))
      mejor = { item, grupo };
  };
  for (const i of MENU) {
    if (i.children) i.children.forEach((h) => revisar(h, i));
    else revisar(i, null);
  }
  return mejor as { item: ItemMenu; grupo: ItemMenu | null } | null;
}

/** Último tramo del breadcrumb para las sub-pantallas sin ítem propio. */
function subtitulo(pathname: string, rutaItem: string): string | null {
  if (pathname === rutaItem) return null;
  if (pathname === '/presupuestos/nuevo') return 'Nuevo presupuesto';
  if (/^\/clientes\/\d+\/direcciones$/.test(pathname)) return 'Direcciones de entrega';
  const id = /^\/ventas\/(\d+)$/.exec(pathname);
  if (id) return `Venta N° ${id[1]}`;
  return null;
}

const ETIQUETA_ROL: Record<RolUsuario, string> = {
  ADMINISTRACION: 'Administración',
  VENDEDOR: 'Vendedor',
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const usuario = useSesionStore((s) => s.usuario);
  const iniciar = useSesionStore((s) => s.iniciar);
  const cerrar = useSesionStore((s) => s.cerrar);

  const [colapsado, setColapsado] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);

  // Si todavía no hay ningún usuario cargado en el sistema, nadie podría
  // "ingresar": en ese caso (configuración inicial) se muestra el menú completo
  // para poder crear sucursales y usuarios.
  const sinUsuarios = !usuario && usuarios !== null && usuarios.length === 0;
  const rolMenu: RolUsuario | null = usuario?.rol ?? (sinUsuarios ? 'ADMINISTRACION' : null);

  const actual = buscarActual(pathname);
  const itemsMenu = useMemo(() => aItemsAntd(filtrarPorRol(MENU, rolMenu)), [rolMenu]);

  // Submenú abierto sincronizado con la ruta (el usuario puede abrir otros).
  const grupoActual = actual?.grupo?.key;
  // Patrón recomendado por React: ajustar el estado cuando cambia la ruta,
  // durante el render (sin useEffect).
  const [openKeys, setOpenKeys] = useState<string[]>(grupoActual ? [grupoActual] : []);
  const [grupoPrevio, setGrupoPrevio] = useState(grupoActual);
  if (grupoActual !== grupoPrevio) {
    setGrupoPrevio(grupoActual);
    if (grupoActual && !openKeys.includes(grupoActual))
      setOpenKeys([...openKeys, grupoActual]);
  }

  // Sin sesión: cargamos los usuarios para poder elegir con cuál ingresar.
  useEffect(() => {
    if (!usuario) void usuariosApi.listar().then(setUsuarios).catch(() => setUsuarios([]));
  }, [usuario]);

  const ingresarComo = (id: number) => {
    const u = usuarios?.find((x) => x.id === id);
    if (!u) return;
    iniciar({
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      rol: u.rol,
      sucursal: u.sucursal?.nombre ?? null,
    });
  };

  const cerrarSesion = () => {
    cerrar();
    navigate('/');
  };

  // Breadcrumb: Grupo / Ítem / (sub-pantalla)
  const migas: { title: ReactNode }[] = [];
  if (actual?.grupo) migas.push({ title: actual.grupo.label });
  if (actual)
    migas.push({
      title:
        actual.item.key === pathname ? (
          actual.item.label
        ) : (
          <Link to={actual.item.key}>{actual.item.label}</Link>
        ),
    });
  const sub = actual ? subtitulo(pathname, actual.item.key) : null;
  if (sub) migas.push({ title: sub });
  if (migas.length === 0) migas.push({ title: 'Página no encontrada' });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={colapsado}
        onCollapse={setColapsado}
        breakpoint="lg"
        width={240}
        theme="light"
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div className="sider-logo" style={{ color: token.colorPrimary }}>
          {colapsado ? 'BSC' : 'BuySellCycle'}
        </div>
        <Menu
          mode="inline"
          items={itemsMenu}
          selectedKeys={actual ? [actual.item.key] : []}
          // En modo colapsado los submenús son flotantes: no se controlan.
          {...(colapsado ? {} : { openKeys, onOpenChange: setOpenKeys })}
          style={{ borderInlineEnd: 'none' }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            paddingInline: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Breadcrumb items={migas} />

          {usuario ? (
            <Space size="middle">
              <Avatar icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
              <Space orientation="vertical" size={0} style={{ lineHeight: 1.3 }}>
                <Typography.Text strong>
                  {usuario.nombre} {usuario.apellido}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  <Tag color={usuario.rol === 'ADMINISTRACION' ? 'purple' : 'blue'} style={{ marginInlineEnd: 6 }}>
                    {ETIQUETA_ROL[usuario.rol]}
                  </Tag>
                  {usuario.sucursal ?? 'Sin sucursal'}
                </Typography.Text>
              </Space>
              <Tooltip title="Cerrar sesión">
                <Button icon={<LogoutOutlined />} onClick={cerrarSesion} />
              </Tooltip>
            </Space>
          ) : (
            <Select
              style={{ width: 260 }}
              placeholder="Ingresar como…"
              showSearch={{ optionFilterProp: 'label' }}
              onChange={ingresarComo}
              loading={usuarios === null}
              notFoundContent="No hay usuarios cargados: crealos en Personas › Usuarios"
              options={(usuarios ?? []).map((u) => ({
                value: u.id,
                label: `${u.apellido}, ${u.nombre} (${ETIQUETA_ROL[u.rol]})`,
              }))}
            />
          )}
        </Header>

        <Content style={{ padding: 24 }}>
          {/* Outlet = acá se dibuja la página de la ruta actual */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
