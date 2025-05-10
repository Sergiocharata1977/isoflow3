// Importar el cliente Turso centralizado
import { tursoClient } from '../lib/tursoClient.js';

// Usar el cliente Turso centralizado configurado con las variables de entorno
const client = tursoClient;

async function createTables() {
  try {
    console.log("Verificando y creando tablas...");

    // Crear tabla de personal si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS personal (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        puesto TEXT,
        departamento TEXT,
        email TEXT,
        telefono TEXT,
        fecha_contratacion TEXT,
        imagen TEXT
      )`
    });
    console.log("Tabla 'personal' verificada/creada");

    // Crear tabla de capacitaciones si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS capacitaciones (
        id INTEGER PRIMARY KEY,
        titulo TEXT NOT NULL,
        instructor TEXT,
        fecha TEXT,
        duracion TEXT,
        descripcion TEXT,
        persona_id INTEGER,
        estado TEXT,
        calificacion INTEGER,
        FOREIGN KEY (persona_id) REFERENCES personal (id) ON DELETE CASCADE
      )`
    });
    console.log("Tabla 'capacitaciones' verificada/creada");

    // Crear tabla de evaluaciones si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS evaluaciones (
        id INTEGER PRIMARY KEY,
        empleado TEXT NOT NULL,
        evaluador TEXT,
        fecha TEXT,
        periodo TEXT,
        resultado INTEGER,
        comentarios TEXT,
        persona_id INTEGER,
        competencias TEXT,
        FOREIGN KEY (persona_id) REFERENCES personal (id) ON DELETE CASCADE
      )`
    });
    console.log("Tabla 'evaluaciones' verificada/creada");

    console.log("Todas las tablas han sido verificadas/creadas correctamente");
  } catch (error) {
    console.error("Error al crear las tablas:", error);
  }
}

// Ejecutar la función para crear las tablas
createTables();
