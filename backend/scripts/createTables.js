// Script para crear las tablas necesarias en la base de datos Turso
import { executeQuery } from '../lib/tursoClient.js';

async function createTables() {
  try {
    console.log('Iniciando creación de tablas...');
    
    // Crear tabla normas
    console.log('Creando tabla normas...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS normas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        version TEXT,
        fecha_vigencia TEXT,
        estado TEXT,
        responsable TEXT,
        observaciones TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);
    console.log('Tabla normas creada exitosamente.');
    
    // Crear tabla documentos
    console.log('Creando tabla documentos...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS documentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        proceso_id INTEGER,
        version TEXT,
        fecha_creacion TEXT,
        fecha_revision TEXT,
        autor TEXT,
        estado TEXT,
        url_documento TEXT,
        tags TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (proceso_id) REFERENCES procesos (id)
      )
    `);
    console.log('Tabla documentos creada exitosamente.');
    
    // Verificar tablas existentes
    const result = await executeQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    console.log('Tablas disponibles en la base de datos:');
    result.data.rows.forEach(row => {
      console.log(`- ${row.name}`);
    });
    
    console.log('Creación de tablas completada exitosamente.');
  } catch (error) {
    console.error('Error al crear tablas:', error);
  }
}

// Ejecutar la función
createTables();
