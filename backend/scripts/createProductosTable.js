import { createClient } from '@libsql/client';

// Configuración del cliente Turso
const client = createClient({
  url: "libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ"
});

async function createTables() {
  try {
    console.log("Verificando y creando tablas de Productos...");

    // Crear tabla de productos si no existe
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        tipo TEXT,
        fecha_inicio TEXT,
        area_responsable TEXT,
        cliente_objetivo TEXT,
        version TEXT,
        descripcion_tecnica TEXT,
        requisitos_cliente TEXT,
        normas_aplicables TEXT,
        origen_insumo TEXT,
        trazabilidad TEXT,
        requisitos_almacenamiento TEXT,
        fases_desarrollo TEXT,
        recursos_necesarios TEXT,
        matriz_riesgos TEXT,
        ensayos_necesarios TEXT,
        fecha_verificacion TEXT,
        ensayos_realizados TEXT,
        resultados_obtenidos TEXT,
        no_conformidades TEXT,
        acciones_correctivas TEXT,
        validacion_cliente TEXT,
        prueba_campo TEXT,
        resultado_validacion TEXT,
        observaciones TEXT,
        autorizacion_comercializar TEXT,
        documentos_adjuntos TEXT,
        estado TEXT,
        fecha_creacion TEXT,
        fecha_actualizacion TEXT
      )`
    });
    console.log("Tabla 'productos' verificada/creada");

    console.log("Todas las tablas de Productos han sido verificadas/creadas correctamente");
  } catch (error) {
    console.error("Error al crear las tablas:", error);
  }
}

// Ejecutar la función para crear las tablas
createTables();
