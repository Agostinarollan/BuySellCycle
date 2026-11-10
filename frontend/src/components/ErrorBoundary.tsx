import { Button, Result } from 'antd';
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { reportarError } from '../utils/errores';

interface Props {
  children: ReactNode;
}
interface State {
  hayError: boolean;
}

/**
 * Error Boundary: si un componente "explota" al dibujarse, React llama a
 * componentDidCatch. Mostramos una pantalla amigable y reportamos el error.
 * (Tiene que ser un componente de CLASE: React no tiene hook para esto.)
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hayError: false };

  static getDerivedStateFromError(): State {
    return { hayError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void reportarError(error, {
      contexto: {
        origen: 'ErrorBoundary',
        componentStack: info.componentStack,
      },
    });
  }

  render() {
    if (this.state.hayError) {
      return (
        <Result
          status="error"
          title="Ocurrió un error inesperado"
          subTitle="El error fue registrado. Podés volver al inicio."
          extra={
            <Button type="primary" onClick={() => (window.location.href = '/')}>
              Volver al inicio
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}
