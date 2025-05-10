// Script para inicializar la base de datos desde la raíz del proyecto
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

// Cargar variables de entorno
dotenv.config();

// Crear el cliente de Turso
const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDatabase() {
  try {
    console.log('Inicializando base de datos Turso...');
    console.log('URL de la base de datos:', process.env.TURSO_DATABASE_URL);
    
    // Crear tabla de usuarios
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          rol TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `
    });
    console.log('Tabla usuarios creada correctamente');
    
    // Crear tabla de noticias
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS noticias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          contenido TEXT NOT NULL,
          autor TEXT NOT NULL,
          fecha TEXT NOT NULL,
          imagen TEXT
        )
      `
    });
    console.log('Tabla noticias creada correctamente');
    
    // Crear tabla de mejoras
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS mejoras (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          descripcion TEXT NOT NULL,
          estado TEXT NOT NULL,
          responsable TEXT NOT NULL,
          fecha_inicio TEXT NOT NULL,
          fecha_fin_estimada TEXT
        )
      `
    });
    console.log('Tabla mejoras creada correctamente');
    
    // Crear tabla de procesos
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS procesos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          codigo TEXT UNIQUE NOT NULL,
          version TEXT NOT NULL,
          responsable TEXT NOT NULL,
          descripcion TEXT
        )
      `
    });
    console.log('Tabla procesos creada correctamente');
    
    // Crear tabla de indicadores
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS indicadores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          descripcion TEXT NOT NULL,
          formula TEXT NOT NULL,
          unidad TEXT NOT NULL,
          meta REAL,
          proceso_id INTEGER,
          FOREIGN KEY (proceso_id) REFERENCES procesos (id)
        )
      `
    });
    console.log('Tabla indicadores creada correctamente');
    
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
}

// Ejecutar la función de inicialización
initDatabase();
