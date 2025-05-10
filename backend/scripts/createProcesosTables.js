// Script para crear las tablas relacionadas con procesos
import { tursoClient } from '../lib/tursoClient.js';

async function createProcesosTables() {
  try {
    console.log("Creando tablas relacionadas con procesos...");

    // Crear tabla de procesos si no existe
    await tursoClient.execute({
      sql: `CREATE TABLE IF NOT EXISTS procesos (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        codigo TEXT NOT NULL,
        version TEXT NOT NULL,
        responsable TEXT,
        descripcion TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`
    });
    console.log("Tabla 'procesos' creada correctamente");

    // Crear tabla de indicadores de procesos si no existe
    await tursoClient.execute({
      sql: `CREATE TABLE IF NOT EXISTS indicadores_proceso (
        id INTEGER PRIMARY KEY,
        proceso_id INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        formula TEXT,
        unidad TEXT,
        frecuencia TEXT,
        meta REAL,
        responsable TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (proceso_id) REFERENCES procesos (id)
      )`
    });
    console.log("Tabla 'indicadores_proceso' creada correctamente");
    
    console.log("Todas las tablas de procesos han sido creadas correctamente");
  } catch (error) {
    console.error("Error al crear tablas de procesos:", error);
  }
}

// Ejecutar la función principal
createProcesosTables()
  .then(() => {
    console.log("Proceso de creación de tablas completado");
  })
  .catch(error => {
    console.error("Error en el proceso principal:", error);
  });
