const { createClient } = require("@libsql/client");

const client = createClient({
  url: "libsql://iso-muestra-104-sergiocharata1977.aws-us-east-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDcwNTEyODEsImlkIjoiYjM2Y2MxYzYtY2I0NC00NzFkLWEyYjYtNGI5MTI0NjQ2MmE4IiwicmlkIjoiZDIyMDRlMGQtMTcxYy00NjhkLTliODUtYzNhYTYzNDlhZmI0In0.UPHEY9j-1l2hs6WyoTinkrFTrhXn3PZxYDuF82PGhrI0flCx5ZTT11myyKIEEG_rk1sfBwn-x2e6oLq0JF2qBw",
});

async function insertProcesos() {
  // Crear tabla si no existe
  await client.execute(`
    CREATE TABLE IF NOT EXISTS procesos (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      codigo TEXT NOT NULL,
      version TEXT NOT NULL,
      objetivo TEXT,
      alcance TEXT,
      descripcion TEXT,
      imagen TEXT,
      entradas TEXT,
      salidas TEXT,
      indicadores TEXT,
      estado TEXT
    )
  `);

  const procesos = [
    {
      id: "1",
      titulo: "Gestión de Calidad",
      codigo: "GC-01",
      version: "1.0",
      objetivo: "Mantener y mejorar el sistema de gestión de calidad",
      alcance: "Toda la organización",
      descripcion:
        "Proceso encargado de mantener y mejorar el sistema de gestión de calidad",
      imagen: "",
      entradas: "Requisitos del cliente\nNormas ISO",
      salidas: "Productos conformes\nInformes de calidad",
      indicadores: "Índice de no conformidades\nSatisfacción del cliente",
      estado: "activo",
    },
    {
      id: "2",
      titulo: "Auditorías Internas",
      codigo: "AI-01",
      version: "1.0",
      objetivo: "Planificar y ejecutar auditorías internas",
      alcance: "Todos los procesos",
      descripcion:
        "Proceso para la planificación y ejecución de auditorías internas",
      imagen: "",
      entradas: "Plan de auditoría",
      salidas: "Informes de auditoría",
      indicadores: "Cantidad de auditorías realizadas",
      estado: "activo",
    },
    {
      id: "3",
      titulo: "Gestión Documental",
      codigo: "GD-01",
      version: "1.0",
      objetivo: "Controlar y gestionar documentos y registros",
      alcance: "Toda la organización",
      descripcion:
        "Proceso para el control y gestión de documentos y registros",
      imagen: "",
      entradas: "Documentos internos\nNormas externas",
      salidas: "Documentos controlados",
      indicadores: "Documentos actualizados",
      estado: "activo",
    },
  ];

  for (const proceso of procesos) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO procesos (id, titulo, codigo, version, objetivo, alcance, descripcion, imagen, entradas, salidas, indicadores, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        proceso.id,
        proceso.titulo,
        proceso.codigo,
        proceso.version,
        proceso.objetivo,
        proceso.alcance,
        proceso.descripcion,
        proceso.imagen,
        proceso.entradas,
        proceso.salidas,
        proceso.indicadores,
        proceso.estado,
      ],
    });
    console.log(`✅ Proceso insertado: ${proceso.titulo}`);
  }

  console.log("✅ Procesos de ejemplo insertados correctamente.");
}

insertProcesos().catch(console.error);
