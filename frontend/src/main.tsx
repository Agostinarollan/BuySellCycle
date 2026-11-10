import { App as AntApp, ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { instalarCapturaErrores } from './utils/errores';

// dayjs en español + plugin "hace X días"
dayjs.locale('es');
dayjs.extend(relativeTime);

// Guía 2: capturar errores globales del frontend y enviarlos a Firestore
instalarCapturaErrores();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ConfigProvider: idioma español para todos los componentes de antd */}
    <ConfigProvider locale={esES}>
      {/* AntApp: habilita message/modal con App.useApp() */}
      <AntApp>
        <ErrorBoundary>
          {/* BrowserRouter: habilita React Router en toda la app */}
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ErrorBoundary>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
