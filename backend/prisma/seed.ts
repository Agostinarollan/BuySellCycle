import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Provincias argentinas con una selección de localidades de cada una.
const datos: Record<string, string[]> = {
  'Buenos Aires': [
    'La Plata',
    'Mar del Plata',
    'Bahía Blanca',
    'Tandil',
    'Pergamino',
    'Junín',
  ],
  'Ciudad Autónoma de Buenos Aires': [
    'Palermo',
    'Caballito',
    'Belgrano',
    'Recoleta',
    'Flores',
  ],
  Catamarca: [
    'San Fernando del Valle de Catamarca',
    'Andalgalá',
    'Belén',
    'Tinogasta',
  ],
  Chaco: [
    'Resistencia',
    'Presidencia Roque Sáenz Peña',
    'Villa Ángela',
    'Charata',
  ],
  Chubut: ['Rawson', 'Trelew', 'Comodoro Rivadavia', 'Puerto Madryn', 'Esquel'],
  Córdoba: [
    'Córdoba',
    'Río Cuarto',
    'Villa María',
    'San Francisco',
    'Villa Carlos Paz',
    'Morteros',
  ],
  Corrientes: ['Corrientes', 'Goya', 'Paso de los Libres', 'Curuzú Cuatiá'],
  'Entre Ríos': [
    'Paraná',
    'Concordia',
    'Gualeguaychú',
    'Concepción del Uruguay',
    'Victoria',
  ],
  Formosa: ['Formosa', 'Clorinda', 'Pirané', 'El Colorado'],
  Jujuy: ['San Salvador de Jujuy', 'Palpalá', 'San Pedro', 'Humahuaca'],
  'La Pampa': ['Santa Rosa', 'General Pico', 'Toay', 'Realicó'],
  'La Rioja': ['La Rioja', 'Chilecito', 'Aimogasta', 'Chamical'],
  Mendoza: ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Maipú', 'Luján de Cuyo'],
  Misiones: ['Posadas', 'Oberá', 'Eldorado', 'Puerto Iguazú'],
  Neuquén: ['Neuquén', 'San Martín de los Andes', 'Zapala', 'Cutral Có'],
  'Río Negro': [
    'Viedma',
    'San Carlos de Bariloche',
    'General Roca',
    'Cipolletti',
  ],
  Salta: ['Salta', 'San Ramón de la Nueva Orán', 'Tartagal', 'Cafayate'],
  'San Juan': ['San Juan', 'Rawson', 'Caucete', 'Jáchal'],
  'San Luis': ['San Luis', 'Villa Mercedes', 'Merlo', 'La Punta'],
  'Santa Cruz': [
    'Río Gallegos',
    'Caleta Olivia',
    'El Calafate',
    'Puerto Deseado',
  ],
  'Santa Fe': [
    'Rafaela',
    'Santa Fe',
    'Rosario',
    'Sunchales',
    'Esperanza',
    'Reconquista',
    'Venado Tuerto',
    'Villa Constitución',
    'Frontera',
    'Susana',
    'Lehmann',
  ],
  'Santiago del Estero': [
    'Santiago del Estero',
    'La Banda',
    'Termas de Río Hondo',
    'Añatuya',
  ],
  'Tierra del Fuego': ['Ushuaia', 'Río Grande', 'Tolhuin'],
  Tucumán: ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Concepción'],
};

async function main() {
  for (const [nombreProvincia, localidades] of Object.entries(datos)) {
    // upsert = "si existe, actualizalo; si no existe, crealo".
    // Así el seed se puede ejecutar varias veces sin duplicar datos.
    const provincia = await prisma.provincia.upsert({
      where: { nombre: nombreProvincia },
      update: {},
      create: { nombre: nombreProvincia },
    });

    for (const nombreLocalidad of localidades) {
      await prisma.localidad.upsert({
        where: {
          nombre_provinciaId: {
            nombre: nombreLocalidad,
            provinciaId: provincia.id,
          },
        },
        update: {},
        create: { nombre: nombreLocalidad, provinciaId: provincia.id },
      });
    }
  }

  const totalProvincias = await prisma.provincia.count();
  const totalLocalidades = await prisma.localidad.count();
  console.log(
    `Seed OK: ${totalProvincias} provincias y ${totalLocalidades} localidades.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
