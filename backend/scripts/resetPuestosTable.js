// Script para eliminar y volver a crear la tabla puestos con la estructura correcta
import { tursoClient } from '../lib/tursoClient.js';

async function resetPuestosTable() {
  try {
    console.log("Eliminando tabla puestos existente...");
    
    // Eliminar la tabla puestos si existe
    await tursoClient.execute({
      sql: `DROP TABLE IF EXISTS puestos`
    });
    console.log("Tabla puestos eliminada correctamente");
    
    // Crear tabla de puestos con la estructura correcta
    console.log("Creando nueva tabla puestos con la estructura correcta...");
    await tursoClient.execute({
      sql: `CREATE TABLE puestos (
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
    console.log("Tabla puestos creada correctamente con la nueva estructura");
    
    return true;
  } catch (error) {
    console.error("Error al resetear la tabla puestos:", error);
    return false;
  }
}

// Ejecutar la función principal
resetPuestosTable()
  .then(() => {
    console.log("Proceso de reseteo de tabla puestos completado con éxito");
  })
  .catch(error => {
    console.error("Error en el proceso principal:", error);
  });
