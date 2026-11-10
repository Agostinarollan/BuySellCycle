import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BancosModule } from './bancos/bancos.module';
import { CategoriasNivel1Module } from './categorias-nivel1/categorias-nivel1.module';
import { CategoriasNivel2Module } from './categorias-nivel2/categorias-nivel2.module';
import { ClientesModule } from './clientes/clientes.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DepositosModule } from './depositos/depositos.module';
import { DireccionesEntregaModule } from './direcciones-entrega/direcciones-entrega.module';
import { ErroresModule } from './errores/errores.module';
import { FinanciacionModule } from './financiacion/financiacion.module';
import { FirebaseModule } from './firebase/firebase.module';
import { MarcasModule } from './marcas/marcas.module';
import { PlanesModule } from './planes/planes.module';
import { PresupuestosModule } from './presupuestos/presupuestos.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductosModule } from './productos/productos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { StockModule } from './stock/stock.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { TarjetasModule } from './tarjetas/tarjetas.module';
import { UbicacionesModule } from './ubicaciones/ubicaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VentasModule } from './ventas/ventas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // lee el archivo .env
    ScheduleModule.forRoot(), // habilita tareas programadas (@Cron)
    PrismaModule,
    FirebaseModule,
    ErroresModule,
    // ---- Guía 1 ----
    UbicacionesModule,
    MarcasModule,
    CategoriasNivel1Module,
    CategoriasNivel2Module,
    DepositosModule,
    SucursalesModule,
    UsuariosModule,
    ClientesModule,
    ProveedoresModule,
    ProductosModule,
    StockModule,
    PresupuestosModule,
    // ---- Guía 2 ----
    DireccionesEntregaModule,
    TarjetasModule,
    BancosModule,
    PlanesModule,
    FinanciacionModule,
    VentasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Filtro global de excepciones, creado por Nest (así recibe inyección).
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
