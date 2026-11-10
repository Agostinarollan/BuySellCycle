import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import InicioPage from './pages/InicioPage';
import BancosPage from './pages/bancos/BancosPage';
import CategoriasPage from './pages/categorias/CategoriasPage';
import ClientesPage from './pages/clientes/ClientesPage';
import DireccionesPage from './pages/clientes/DireccionesPage';
import DepositosPage from './pages/depositos/DepositosPage';
import ErroresPage from './pages/errores/ErroresPage';
import SimuladorPage from './pages/financiacion/SimuladorPage';
import MarcasPage from './pages/marcas/MarcasPage';
import PlanesPage from './pages/planes/PlanesPage';
import NuevoPresupuestoPage from './pages/presupuestos/NuevoPresupuestoPage';
import PresupuestosPage from './pages/presupuestos/PresupuestosPage';
import ProductosPage from './pages/productos/ProductosPage';
import ProveedoresPage from './pages/proveedores/ProveedoresPage';
import StockPage from './pages/stock/StockPage';
import SucursalesPage from './pages/sucursales/SucursalesPage';
import TarjetasPage from './pages/tarjetas/TarjetasPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import NuevaVentaPage from './pages/ventas/NuevaVentaPage';
import VentaDetallePage from './pages/ventas/VentaDetallePage';
import VentasPage from './pages/ventas/VentasPage';

/**
 * Mapa de rutas de la SPA. Todas se dibujan DENTRO de AppLayout
 * (menú lateral + <Outlet />). Cambiar de ruta NO recarga la página.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<InicioPage />} />
        {/* ----- Guía 1 ----- */}
        <Route path="/marcas" element={<MarcasPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/depositos" element={<DepositosPage />} />
        <Route path="/sucursales" element={<SucursalesPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/proveedores" element={<ProveedoresPage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/presupuestos" element={<PresupuestosPage />} />
        <Route path="/presupuestos/nuevo" element={<NuevoPresupuestoPage />} />
        {/* ----- Guía 2 ----- */}
        <Route path="/clientes/:id/direcciones" element={<DireccionesPage />} />
        <Route path="/tarjetas" element={<TarjetasPage />} />
        <Route path="/bancos" element={<BancosPage />} />
        <Route path="/planes" element={<PlanesPage />} />
        <Route path="/simulador" element={<SimuladorPage />} />
        <Route path="/ventas" element={<VentasPage />} />
        <Route path="/ventas/nueva" element={<NuevaVentaPage />} />
        <Route path="/ventas/:id" element={<VentaDetallePage />} />
        <Route path="/errores" element={<ErroresPage />} />
        <Route path="*" element={<h2>Página no encontrada</h2>} />
      </Route>
    </Routes>
  );
}
