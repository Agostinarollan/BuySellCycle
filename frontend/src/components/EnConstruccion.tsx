import { Result } from 'antd';

/** Pantalla provisoria para las rutas que se construyen en días siguientes. */
export default function EnConstruccion({
  titulo,
  dia,
}: {
  titulo: string;
  dia: number;
}) {
  return (
    <Result
      status="info"
      title={titulo}
      subTitle={`Esta pantalla se construye en el Día ${dia} del manual.`}
    />
  );
}
