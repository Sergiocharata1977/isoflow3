import { createClient } from '@libsql/client';

// Configuración del cliente Turso
const client = createClient({
  url: "libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ"
});

async function createTables() {
  try {
    console.log("Verificando y creando tablas de RRHH...");

    // Crear tabla de departamentos si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS departamentos (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        responsable TEXT,
        descripcion TEXT,
        objetivos TEXT,
        email TEXT,
        telefono TEXT,
        ubicacion TEXT,
        presupuesto TEXT,
        fecha_creacion TEXT,
        departamento_padre_id INTEGER,
        subdepartamentos TEXT,
        personal TEXT
      )`
    });
    console.log("Tabla 'departamentos' verificada/creada");

    // Crear tabla de puestos si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS puestos (
        id INTEGER PRIMARY KEY,
        codigo TEXT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        departamento TEXT,
        supervisor TEXT,
        estado TEXT,
        requisitos TEXT,
        funciones TEXT,
        responsabilidades TEXT,
        competencias TEXT,
        formacion TEXT,
        experiencia TEXT,
        personal TEXT
      )`
    });
    console.log("Tabla 'puestos' verificada/creada");

    // Crear tabla de capacitaciones_rrhh si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS capacitaciones_rrhh (
        id INTEGER PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        instructor TEXT,
        fecha_inicio TEXT,
        fecha_fin TEXT,
        duracion TEXT,
        estado TEXT,
        tipo TEXT,
        modalidad TEXT,
        participantes TEXT,
        objetivos TEXT,
        contenido TEXT,
        recursos TEXT,
        evaluacion TEXT,
        costo TEXT
      )`
    });
    console.log("Tabla 'capacitaciones_rrhh' verificada/creada");

    // Crear tabla de evaluaciones_rrhh si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS evaluaciones_rrhh (
        id INTEGER PRIMARY KEY,
        titulo TEXT NOT NULL,
        empleado TEXT,
        evaluador TEXT,
        puesto TEXT,
        departamento TEXT,
        fecha TEXT,
        periodo TEXT,
        tipo TEXT,
        estado TEXT,
        competencias TEXT,
        resultados TEXT,
        objetivos TEXT,
        fortalezas TEXT,
        areas_mejora TEXT,
        plan_accion TEXT,
        comentarios TEXT
      )`
    });
    console.log("Tabla 'evaluaciones_rrhh' verificada/creada");

    console.log("Todas las tablas de RRHH han sido verificadas/creadas correctamente");
  } catch (error) {
    console.error("Error al crear las tablas:", error);
  }
}

// Ejecutar la función para crear las tablas
createTables();
