-- CreateTable
CREATE TABLE `Provincia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Provincia_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Localidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `provinciaId` INTEGER NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Localidad_nombre_provinciaId_key`(`nombre`, `provinciaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Marca` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Marca_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaNivel1` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CategoriaNivel1_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaNivel2` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `categoriaNivel1Id` INTEGER NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CategoriaNivel2_nombre_categoriaNivel1Id_key`(`nombre`, `categoriaNivel1Id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deposito` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(10) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `provinciaId` INTEGER NOT NULL,
    `localidadId` INTEGER NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Deposito_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sucursal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `provinciaId` INTEGER NOT NULL,
    `localidadId` INTEGER NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `dni` VARCHAR(10) NOT NULL,
    `nombreUsuario` VARCHAR(50) NOT NULL,
    `rol` ENUM('ADMINISTRACION', 'VENDEDOR') NOT NULL,
    `sucursalId` INTEGER NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_dni_key`(`dni`),
    UNIQUE INDEX `Usuario_nombreUsuario_key`(`nombreUsuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `dni` VARCHAR(10) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `provinciaId` INTEGER NOT NULL,
    `localidadId` INTEGER NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cliente_dni_key`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proveedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `razonSocial` VARCHAR(150) NOT NULL,
    `cuit` VARCHAR(13) NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Proveedor_cuit_key`(`cuit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `stockTotal` INTEGER NOT NULL DEFAULT 0,
    `costoNeto` DECIMAL(12, 2) NOT NULL,
    `utilidad` DECIMAL(5, 2) NOT NULL,
    `precioLista` DECIMAL(12, 2) NOT NULL,
    `descuentoContado` DECIMAL(5, 2) NOT NULL,
    `precioContado` DECIMAL(12, 2) NOT NULL,
    `estado` ENUM('DISPONIBLE', 'ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'DISPONIBLE',
    `fechaUltimoMovimientoStock` DATETIME(3) NULL,
    `fechaUltimaSincronizacionStock` DATETIME(3) NULL,
    `rutaImagen` VARCHAR(255) NULL,
    `marcaId` INTEGER NOT NULL,
    `categoriaNivel2Id` INTEGER NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockProductoDeposito` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productoId` INTEGER NOT NULL,
    `depositoId` INTEGER NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StockProductoDeposito_productoId_depositoId_key`(`productoId`, `depositoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MovimientoStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('INGRESO', 'EGRESO', 'TRANSFERENCIA') NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `productoId` INTEGER NOT NULL,
    `depositoOrigenId` INTEGER NULL,
    `depositoDestinoId` INTEGER NULL,
    `proveedorId` INTEGER NULL,
    `ventaId` INTEGER NULL,
    `observacion` VARCHAR(255) NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presupuesto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `usuarioId` INTEGER NULL,
    `fechaVencimiento` DATETIME(3) NOT NULL,
    `observaciones` VARCHAR(500) NULL,
    `totalContado` DECIMAL(12, 2) NOT NULL,
    `totalLista` DECIMAL(12, 2) NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetallePresupuesto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `presupuestoId` INTEGER NOT NULL,
    `productoId` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precioContado` DECIMAL(12, 2) NOT NULL,
    `precioLista` DECIMAL(12, 2) NOT NULL,
    `subtotalContado` DECIMAL(12, 2) NOT NULL,
    `subtotalLista` DECIMAL(12, 2) NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DireccionEntrega` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `direccion` VARCHAR(255) NOT NULL,
    `esPrincipal` BOOLEAN NOT NULL DEFAULT false,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tarjeta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `tipo` ENUM('CREDITO', 'DEBITO') NOT NULL,
    `rutaImagen` VARCHAR(255) NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tarjeta_nombre_tipo_key`(`nombre`, `tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Banco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Banco_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tarjetaId` INTEGER NOT NULL,
    `bancoId` INTEGER NOT NULL,
    `cantidadCuotas` INTEGER NOT NULL,
    `tasaFinanciacion` DECIMAL(6, 2) NOT NULL,
    `observaciones` VARCHAR(500) NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Plan_tarjetaId_bancoId_cantidadCuotas_key`(`tarjetaId`, `bancoId`, `cantidadCuotas`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Venta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `modoPago` ENUM('CONTADO', 'PLAN') NOT NULL,
    `planId` INTEGER NULL,
    `cantidadCuotas` INTEGER NULL,
    `tasaFinanciacion` DECIMAL(6, 2) NULL,
    `tipoEntrega` ENUM('RETIRO_SUCURSAL', 'DOMICILIO') NOT NULL,
    `sucursalId` INTEGER NULL,
    `direccionEntrega` VARCHAR(255) NULL,
    `estado` ENUM('EN_PREPARACION', 'DISPONIBLE_PARA_RETIRAR', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'EN_PREPARACION',
    `motivoCancelacion` VARCHAR(500) NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `montoCuota` DECIMAL(12, 2) NULL,
    `fechaUltimoEnvioEmail` DATETIME(3) NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetalleVenta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ventaId` INTEGER NOT NULL,
    `productoId` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precioUnitario` DECIMAL(12, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Localidad` ADD CONSTRAINT `Localidad_provinciaId_fkey` FOREIGN KEY (`provinciaId`) REFERENCES `Provincia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaNivel2` ADD CONSTRAINT `CategoriaNivel2_categoriaNivel1Id_fkey` FOREIGN KEY (`categoriaNivel1Id`) REFERENCES `CategoriaNivel1`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposito` ADD CONSTRAINT `Deposito_provinciaId_fkey` FOREIGN KEY (`provinciaId`) REFERENCES `Provincia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposito` ADD CONSTRAINT `Deposito_localidadId_fkey` FOREIGN KEY (`localidadId`) REFERENCES `Localidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sucursal` ADD CONSTRAINT `Sucursal_provinciaId_fkey` FOREIGN KEY (`provinciaId`) REFERENCES `Provincia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sucursal` ADD CONSTRAINT `Sucursal_localidadId_fkey` FOREIGN KEY (`localidadId`) REFERENCES `Localidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_provinciaId_fkey` FOREIGN KEY (`provinciaId`) REFERENCES `Provincia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_localidadId_fkey` FOREIGN KEY (`localidadId`) REFERENCES `Localidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `Marca`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_categoriaNivel2Id_fkey` FOREIGN KEY (`categoriaNivel2Id`) REFERENCES `CategoriaNivel2`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockProductoDeposito` ADD CONSTRAINT `StockProductoDeposito_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockProductoDeposito` ADD CONSTRAINT `StockProductoDeposito_depositoId_fkey` FOREIGN KEY (`depositoId`) REFERENCES `Deposito`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimientoStock` ADD CONSTRAINT `MovimientoStock_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimientoStock` ADD CONSTRAINT `MovimientoStock_depositoOrigenId_fkey` FOREIGN KEY (`depositoOrigenId`) REFERENCES `Deposito`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimientoStock` ADD CONSTRAINT `MovimientoStock_depositoDestinoId_fkey` FOREIGN KEY (`depositoDestinoId`) REFERENCES `Deposito`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimientoStock` ADD CONSTRAINT `MovimientoStock_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimientoStock` ADD CONSTRAINT `MovimientoStock_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetallePresupuesto` ADD CONSTRAINT `DetallePresupuesto_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetallePresupuesto` ADD CONSTRAINT `DetallePresupuesto_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DireccionEntrega` ADD CONSTRAINT `DireccionEntrega_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_tarjetaId_fkey` FOREIGN KEY (`tarjetaId`) REFERENCES `Tarjeta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_bancoId_fkey` FOREIGN KEY (`bancoId`) REFERENCES `Banco`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetalleVenta` ADD CONSTRAINT `DetalleVenta_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetalleVenta` ADD CONSTRAINT `DetalleVenta_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
