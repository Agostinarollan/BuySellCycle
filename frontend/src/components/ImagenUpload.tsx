import { UploadOutlined } from '@ant-design/icons';
import { App, Button, Upload } from 'antd';
import { useState } from 'react';
import { obtenerMensajeError } from '../api/http';

interface Props {
  subir: (archivo: File) => Promise<unknown>;
  alTerminar: () => void;
}

/** Botón que elige una imagen y la envía al backend (multipart/form-data). */
export default function ImagenUpload({ subir, alTerminar }: Props) {
  const { message } = App.useApp();
  const [subiendo, setSubiendo] = useState(false);

  return (
    <Upload
      accept="image/png,image/jpeg,image/webp"
      showUploadList={false}
      // beforeUpload devuelve false => antd NO sube solo; lo hacemos nosotros.
      beforeUpload={(archivo) => {
        setSubiendo(true);
        subir(archivo)
          .then(() => {
            message.success('Imagen subida');
            alTerminar();
          })
          .catch((error: unknown) => message.error(obtenerMensajeError(error)))
          .finally(() => setSubiendo(false));
        return false;
      }}
    >
      <Button icon={<UploadOutlined />} loading={subiendo}>
        Imagen
      </Button>
    </Upload>
  );
}
