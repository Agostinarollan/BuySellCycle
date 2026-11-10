import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ImagenesService } from './imagenes.service';

@Global()
@Module({
  providers: [FirebaseService, ImagenesService],
  exports: [FirebaseService, ImagenesService],
})
export class FirebaseModule {}
