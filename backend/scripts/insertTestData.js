// Script para insertar datos de prueba en la base de datos
import { tursoClient, executeQuery } from '../lib/tursoClient.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function checkTablesExist() {
  try {
    console.log('Verificando existencia de tablas necesarias...');
    
    // Verificar si la tabla puestos existe
    const puestosExist = await tursoClient.execute({
      sql: `SELECT name FROM sqlite_master WHERE type='table' AND name='puestos'`
    });
    
    if (puestosExist.rows.length === 0) {
      console.log('La tabla puestos no existe. Por favor, ejecute primero el script createPuestosTable.js');
      return false;
    }
    console.log('Tabla puestos verificada correctamente');
    
    // Crear tabla de personal
    await tursoClient.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS personal (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          telefono TEXT,
          puesto_id INTEGER,
          fecha_contratacion TEXT NOT NULL,
          salario REAL,
          activo INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          FOREIGN KEY (puesto_id) REFERENCES puestos (id)
        )
      `
    });
    console.log('Tabla personal creada correctamente');
    
    return true;
  } catch (error) {
    console.error('Error al crear tablas:', error);
    return false;
  }
}

async function insertTestData() {
  try {
    // Insertar datos de prueba en puestos
    const puestos = [
      {
        nombre: 'Gerente de Calidad',
        departamento: 'Calidad',
        descripcion: 'Responsable de supervisar todos los procesos de calidad',
        nivel: 'Medio',
        created_at: new Date().toISOString()
      },
      {
        nombre: 'Analista de Procesos',
        departamento: 'Calidad',
        descripcion: 'Encargado de analizar y mejorar los procesos',
        nivel: 'Bajo',
        created_at: new Date().toISOString()
      },
      {
        nombre: 'Auditor Interno',
        departamento: 'Calidad',
        descripcion: 'Realiza auditorías internas de calidad',
        nivel: 'Medio',
        created_at: new Date().toISOString()
      },
      {
        nombre: 'Especialista en Documentación',
        departamento: 'Calidad',
        descripcion: 'Gestiona la documentación del sistema de calidad',
        nivel: 'Bajo',
        created_at: new Date().toISOString()
      },
      {
        nombre: 'Director de Operaciones',
        departamento: 'Operaciones',
        descripcion: 'Responsable de todas las operaciones de la empresa',
        nivel: 'Alto',
        created_at: new Date().toISOString()
      }
    ];
    
    console.log('Insertando datos de prueba en puestos...');
    
    for (const puesto of puestos) {
      await tursoClient.execute({
        sql: `
          INSERT INTO puestos (nombre, departamento, descripcion, nivel, created_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [puesto.nombre, puesto.departamento, puesto.descripcion, puesto.nivel, puesto.created_at]
      });
    }
    
    console.log('Datos de prueba insertados en puestos correctamente');
    
    // Obtener los IDs de los puestos insertados
    const puestosResult = await tursoClient.execute({
      sql: 'SELECT id, nombre FROM puestos'
    });
    
    const puestosMap = {};
    puestosResult.rows.forEach(row => {
      puestosMap[row.nombre] = row.id;
    });
    
    // Insertar datos de prueba en personal
    const personal = [
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@empresa.com',
        telefono: '555-1234',
        puesto_id: puestosMap['Gerente de Calidad'],
        fecha_contratacion: '2022-01-15',
        salario: 85000,
        activo: 1,
        created_at: new Date().toISOString()
      },
      {
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@empresa.com',
        telefono: '555-5678',
        puesto_id: puestosMap['Analista de Procesos'],
        fecha_contratacion: '2022-03-10',
        salario: 65000,
        activo: 1,
        created_at: new Date().toISOString()
      },
      {
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        email: 'carlos.rodriguez@empresa.com',
        telefono: '555-9012',
        puesto_id: puestosMap['Auditor Interno'],
        fecha_contratacion: '2022-02-20',
        salario: 70000,
        activo: 1,
        created_at: new Date().toISOString()
      },
      {
        nombre: 'Laura',
        apellido: 'Martínez',
        email: 'laura.martinez@empresa.com',
        telefono: '555-3456',
        puesto_id: puestosMap['Especialista en Documentación'],
        fecha_contratacion: '2022-04-05',
        salario: 60000,
        activo: 1,
        created_at: new Date().toISOString()
      },
      {
        nombre: 'Roberto',
        apellido: 'Sánchez',
        email: 'roberto.sanchez@empresa.com',
        telefono: '555-7890',
        puesto_id: puestosMap['Director de Operaciones'],
        fecha_contratacion: '2021-11-10',
        salario: 95000,
        activo: 1,
        created_at: new Date().toISOString()
      },
      {
        nombre: 'Ana',
        apellido: 'López',
        email: 'ana.lopez@empresa.com',
        telefono: '555-2345',
        puesto_id: puestosMap['Analista de Procesos'],
        fecha_contratacion: '2022-05-15',
        salario: 62000,
        activo: 1,
        created_at: new Date().toISOString()
      },
      {
        nombre: 'Miguel',
        apellido: 'Fernández',
        email: 'miguel.fernandez@empresa.com',
        telefono: '555-6789',
        puesto_id: puestosMap['Especialista en Documentación'],
        fecha_contratacion: '2022-06-01',
        salario: 58000,
        activo: 0,
        created_at: new Date().toISOString()
      }
    ];
    
    console.log('Insertando datos de prueba en personal...');
    
    for (const persona of personal) {
      await tursoClient.execute({
        sql: `
          INSERT INTO personal (nombre, apellido, email, telefono, puesto_id, fecha_contratacion, salario, activo, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          persona.nombre, 
          persona.apellido, 
          persona.email, 
          persona.telefono, 
          persona.puesto_id, 
          persona.fecha_contratacion, 
          persona.salario, 
          persona.activo, 
          persona.created_at
        ]
      });
    }
    
    console.log('Datos de prueba insertados en personal correctamente');
    
    return true;
  } catch (error) {
    console.error('Error al insertar datos de prueba:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('Iniciando inserción de datos de prueba...');
    console.log('URL de la base de datos:', process.env.TURSO_DATABASE_URL);
    
    // Verificar que las tablas necesarias existen
    const tablesExist = await checkTablesExist();
  
    if (!tablesExist) {
      console.error('Error: No existen las tablas necesarias.');
      return false;
    }
    
    // Insertar datos de prueba
    const dataInserted = await insertTestData();
    if (!dataInserted) {
      console.error('Error al insertar los datos de prueba.');
      return;
    }
    
    console.log('Proceso completado correctamente.');
    
    // Consultar datos insertados para verificar
    console.log('\nPuestos insertados:');
    const puestosResult = await tursoClient.execute({
      sql: 'SELECT * FROM puestos'
    });
    console.log(`Total de puestos: ${puestosResult.rows.length}`);
    
    console.log('\nPersonal insertado:');
    const personalResult = await tursoClient.execute({
      sql: 'SELECT * FROM personal'
    });
    console.log(`Total de personal: ${personalResult.rows.length}`);
    
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

// Ejecutar la función principal
main();
