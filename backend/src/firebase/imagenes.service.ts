import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import sharp from 'sharp';
import { FirebaseService } from './firebase.service';

export type CarpetaImagen = 'productos' | 'tarjetas';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANIO_MAXIMO = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class ImagenesService {
  constructor(private readonly firebase: FirebaseService) {}

  /**
   * 1) valida el archivo  2) Sharp lo achica y convierte a WebP
   * 3) lo sube a Cloud Storage  4) devuelve la ruta para guardar en MySQL.
   */
  async subir(
    carpeta: CarpetaImagen,
    id: number,
    archivo: Express.Multer.File | undefined,
  ): Promise<string> {
    if (!archivo) throw new BadRequestException('No se recibió ninguna imagen');
    if (!TIPOS_PERMITIDOS.includes(archivo.mimetype))
      throw new BadRequestException('La imagen debe ser JPG, PNG o WEBP');
    if (archivo.size > TAMANIO_MAXIMO)
      throw new BadRequestException('La imagen no puede superar 5 MB');

    const buffer = await sharp(archivo.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const ruta = `${carpeta}/${id}-${Date.now()}.webp`;
    await this.firebase
      .bucket()
      .file(ruta)
      .save(buffer, { contentType: 'image/webp' });
    return ruta;
  }

  async descargar(ruta: string | null): Promise<Buffer> {
    if (!ruta) throw new NotFoundException('El registro no tiene imagen');
    const archivo = this.firebase.bucket().file(ruta);
    const [existe] = await archivo.exists();
    if (!existe) throw new NotFoundException('La imagen no existe en Storage');
    const [contenido] = await archivo.download();
    return contenido;
  }

  async eliminar(ruta: string | null): Promise<void> {
    if (!ruta) return;
    await this.firebase.bucket().file(ruta).delete({ ignoreNotFound: true });
  }
}
