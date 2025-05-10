// Script para crear la tabla de puestos
import { tursoClient } from '../lib/tursoClient.js';

async function createPuestosTable() {
  try {
    console.log("Creando tabla de puestos...");

    // Crear tabla de puestos si no existe
    await tursoClient.execute({
      sql: `CREATE TABLE IF NOT EXISTS puestos (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        departamento TEXT,
        descripcion TEXT,
        nivel TEXT,
        requisitos TEXT,
        responsabilidades TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`
    });
    console.log("Tabla 'puestos' creada correctamente");
    
    console.log("Proceso de creación de tabla puestos completado");
  } catch (error) {
    console.error("Error al crear tabla de puestos:", error);
  }
}

// Ejecutar la función principal
createPuestosTable()
  .then(() => {
    console.log("Proceso finalizado con éxito");
  })
  .catch(error => {
    console.error("Error en el proceso principal:", error);
  });
