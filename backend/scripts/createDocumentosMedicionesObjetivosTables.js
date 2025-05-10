import { createClient } from '@libsql/client';

// Configuración del cliente Turso
const client = createClient({
  url: "libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ"
});

async function createTables() {
  try {
    console.log("Verificando y creando tablas...");

    // Crear tabla de documentos si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS documentos (
        id INTEGER PRIMARY KEY,
        titulo TEXT NOT NULL,
        procesos TEXT,
        version TEXT,
        descripcion TEXT,
        fecha_creacion TEXT,
        fecha_revision TEXT,
        autor TEXT,
        estado TEXT,
        archivo_url TEXT
      )`
    });
    console.log("Tabla 'documentos' verificada/creada");

    // Crear tabla de objetivos si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS objetivos (
        id INTEGER PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        responsable TEXT,
        proceso_id INTEGER,
        proceso_nombre TEXT,
        meta TEXT,
        fecha_inicio TEXT,
        fecha_fin TEXT,
        estado TEXT,
        FOREIGN KEY (proceso_id) REFERENCES procesos (id) ON DELETE CASCADE
      )`
    });
    console.log("Tabla 'objetivos' verificada/creada");

    // Crear tabla de mediciones si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS mediciones (
        id INTEGER PRIMARY KEY,
        titulo TEXT NOT NULL,
        fecha TEXT,
        medicion TEXT,
        comentarios TEXT,
        indicador_id INTEGER,
        indicador_titulo TEXT,
        objetivo_id INTEGER,
        proceso_id INTEGER,
        valor_numerico REAL,
        estado TEXT,
        FOREIGN KEY (indicador_id) REFERENCES indicadores (id) ON DELETE CASCADE,
        FOREIGN KEY (objetivo_id) REFERENCES objetivos (id) ON DELETE CASCADE,
        FOREIGN KEY (proceso_id) REFERENCES procesos (id) ON DELETE CASCADE
      )`
    });
    console.log("Tabla 'mediciones' verificada/creada");

    console.log("Todas las tablas han sido verificadas/creadas correctamente");
  } catch (error) {
    console.error("Error al crear las tablas:", error);
  }
}

// Ejecutar la función para crear las tablas
createTables();
