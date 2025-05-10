// Script para crear todas las tablas necesarias en la base de datos
import { tursoClient } from '../lib/tursoClient.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Función para crear todas las tablas
async function createAllTables() {
  try {
    console.log('Iniciando creación de todas las tablas en la base de datos...');
    console.log('URL de la base de datos:', process.env.TURSO_DATABASE_URL);
    
    // Crear tabla de auditorías
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS auditorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          tipo TEXT NOT NULL,
          fecha_inicio TEXT NOT NULL,
          fecha_fin TEXT,
          responsable TEXT NOT NULL,
          estado TEXT NOT NULL,
          resultado TEXT,
          observaciones TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `
    });
    console.log('Tabla auditorias creada correctamente');
    
    // Crear tabla de hallazgos de auditoría
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS hallazgos_auditoria (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          auditoria_id INTEGER NOT NULL,
          descripcion TEXT NOT NULL,
          tipo TEXT NOT NULL,
          proceso_id INTEGER,
          responsable TEXT NOT NULL,
          fecha_deteccion TEXT NOT NULL,
          estado TEXT NOT NULL,
          accion_correctiva TEXT,
          fecha_cierre TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          FOREIGN KEY (auditoria_id) REFERENCES auditorias (id),
          FOREIGN KEY (proceso_id) REFERENCES procesos (id)
        )
      `
    });
    console.log('Tabla hallazgos_auditoria creada correctamente');
    
    // Crear tabla de eventos de calendario
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS eventos_calendario (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          descripcion TEXT,
          fecha_inicio TEXT NOT NULL,
          fecha_fin TEXT NOT NULL,
          tipo TEXT NOT NULL,
          color TEXT,
          todo_el_dia INTEGER DEFAULT 0,
          responsable TEXT,
          participantes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `
    });
    console.log('Tabla eventos_calendario creada correctamente');
    
    // Crear tabla de documentos
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS documentos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo TEXT NOT NULL,
          titulo TEXT NOT NULL,
          descripcion TEXT,
          tipo TEXT NOT NULL,
          version TEXT NOT NULL,
          fecha_emision TEXT NOT NULL,
          fecha_revision TEXT,
          estado TEXT NOT NULL,
          proceso_id INTEGER,
          responsable TEXT NOT NULL,
          ruta_archivo TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          FOREIGN KEY (proceso_id) REFERENCES procesos (id)
        )
      `
    });
    console.log('Tabla documentos creada correctamente');
    
    // Crear tabla de revisiones de documentos
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS revisiones_documento (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          documento_id INTEGER NOT NULL,
          version TEXT NOT NULL,
          fecha_revision TEXT NOT NULL,
          responsable TEXT NOT NULL,
          cambios TEXT NOT NULL,
          estado TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (documento_id) REFERENCES documentos (id)
        )
      `
    });
    console.log('Tabla revisiones_documento creada correctamente');
    
    // Crear tabla de encuestas
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS encuestas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          descripcion TEXT,
          fecha_inicio TEXT NOT NULL,
          fecha_fin TEXT,
          estado TEXT NOT NULL,
          tipo TEXT NOT NULL,
          responsable TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `
    });
    console.log('Tabla encuestas creada correctamente');
    
    // Crear tabla de preguntas de encuesta
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS preguntas_encuesta (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          encuesta_id INTEGER NOT NULL,
          texto TEXT NOT NULL,
          tipo TEXT NOT NULL,
          opciones TEXT,
          obligatoria INTEGER DEFAULT 1,
          orden INTEGER,
          created_at TEXT NOT NULL,
          FOREIGN KEY (encuesta_id) REFERENCES encuestas (id)
        )
      `
    });
    console.log('Tabla preguntas_encuesta creada correctamente');
    
    // Crear tabla de respuestas de encuesta
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS respuestas_encuesta (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pregunta_id INTEGER NOT NULL,
          encuesta_id INTEGER NOT NULL,
          respuesta TEXT NOT NULL,
          respondente TEXT,
          fecha_respuesta TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (pregunta_id) REFERENCES preguntas_encuesta (id),
          FOREIGN KEY (encuesta_id) REFERENCES encuestas (id)
        )
      `
    });
    console.log('Tabla respuestas_encuesta creada correctamente');
    
    // Tabla mejoras ya existe en initDb.js
    
    // Crear tabla de acciones de mejora
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS acciones_mejora (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mejora_id INTEGER NOT NULL,
          descripcion TEXT NOT NULL,
          responsable TEXT NOT NULL,
          fecha_inicio TEXT NOT NULL,
          fecha_fin_estimada TEXT,
          fecha_fin_real TEXT,
          estado TEXT NOT NULL,
          resultado TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          FOREIGN KEY (mejora_id) REFERENCES mejoras (id)
        )
      `
    });
    console.log('Tabla acciones_mejora creada correctamente');
    
    // Crear tabla de normas
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS normas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo TEXT NOT NULL,
          titulo TEXT NOT NULL,
          descripcion TEXT,
          version TEXT NOT NULL,
          organismo TEXT NOT NULL,
          fecha_publicacion TEXT NOT NULL,
          estado TEXT NOT NULL,
          ruta_archivo TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `
    });
    console.log('Tabla normas creada correctamente');
    
    // Crear tabla de requisitos de norma
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS requisitos_norma (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          norma_id INTEGER NOT NULL,
          numero TEXT NOT NULL,
          descripcion TEXT NOT NULL,
          proceso_id INTEGER,
          responsable TEXT,
          estado_cumplimiento TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          FOREIGN KEY (norma_id) REFERENCES normas (id),
          FOREIGN KEY (proceso_id) REFERENCES procesos (id)
        )
      `
    });
    console.log('Tabla requisitos_norma creada correctamente');
    
    // Tabla noticias ya existe en initDb.js
    
    // Tabla personal ya creada en insertTestData.js
    
    // Tabla procesos ya existe en initDb.js
    
    // Tabla indicadores ya existe en initDb.js
    
    // Crear tabla de recursos humanos - capacitaciones
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS capacitaciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          descripcion TEXT,
          tipo TEXT NOT NULL,
          fecha_inicio TEXT NOT NULL,
          fecha_fin TEXT NOT NULL,
          duracion INTEGER,
          instructor TEXT,
          lugar TEXT,
          estado TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `
    });
    console.log('Tabla capacitaciones creada correctamente');
    
    // Crear tabla de participantes de capacitación
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS participantes_capacitacion (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          capacitacion_id INTEGER NOT NULL,
          personal_id INTEGER NOT NULL,
          asistencia INTEGER DEFAULT 0,
          calificacion REAL,
          observaciones TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones (id),
          FOREIGN KEY (personal_id) REFERENCES personal (id)
        )
      `
    });
    console.log('Tabla participantes_capacitacion creada correctamente');
    
    // Crear tabla de evaluaciones de desempeño
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS evaluaciones_desempeno (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          personal_id INTEGER NOT NULL,
          fecha_evaluacion TEXT NOT NULL,
          periodo TEXT NOT NULL,
          evaluador TEXT NOT NULL,
          resultado REAL,
          fortalezas TEXT,
          areas_mejora TEXT,
          objetivos TEXT,
          estado TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          FOREIGN KEY (personal_id) REFERENCES personal (id)
        )
      `
    });
    console.log('Tabla evaluaciones_desempeno creada correctamente');
    
    console.log('Todas las tablas han sido creadas correctamente');
    return true;
  } catch (error) {
    console.error('Error al crear las tablas:', error);
    return false;
  }
}

// Ejecutar la función principal
createAllTables();
