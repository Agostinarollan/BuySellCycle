import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Punto único de conexión con Firebase (usando firebase-admin).
 * Como las variables FIRESTORE_EMULATOR_HOST y FIREBASE_STORAGE_EMULATOR_HOST
 * están en el .env, firebase-admin se conecta a los EMULADORES locales
 * y no a la nube de Google.
 */
@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private readonly app: App;
  private readonly db: Firestore;

  constructor(config: ConfigService) {
    this.app =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            projectId: config.get<string>('FIREBASE_PROJECT_ID'),
            storageBucket: config.get<string>('FIREBASE_STORAGE_BUCKET'),
          });
    this.db = getFirestore(this.app);
    // Firestore rechaza documentos con campos "undefined" (ej. un body vacío
    // en un GET). Con esta opción esos campos simplemente se omiten.
    // settings() solo se puede llamar una vez, antes de usar Firestore.
    this.db.settings({ ignoreUndefinedProperties: true });
    this.logger.log(
      `Firebase inicializado (Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}, Storage: ${process.env.FIREBASE_STORAGE_EMULATOR_HOST})`,
    );
  }

  firestore(): Firestore {
    return this.db;
  }

  bucket() {
    return getStorage(this.app).bucket();
  }
}
