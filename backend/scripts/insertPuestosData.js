// Script para insertar datos de prueba en la tabla de puestos
import { tursoClient } from '../lib/tursoClient.js';

async function insertPuestosData() {
  try {
    console.log('Insertando datos de prueba en la tabla puestos...');
    
    // Verificar si la tabla puestos existe
    const tableExists = await tursoClient.execute({
      sql: `SELECT name FROM sqlite_master WHERE type='table' AND name='puestos'`
    });
    
    if (tableExists.rows.length === 0) {
      console.error('Error: La tabla puestos no existe. Ejecute primero el script createPuestosTable.js');
      return false;
    }
    
    // Datos de prueba para puestos
    const puestos = [
      {
        nombre: 'Gerente de Calidad',
        departamento: 'Calidad',
        descripcion: 'Responsable de supervisar todos los procesos de calidad',
        nivel: 'Alto',
        requisitos: 'Experiencia en sistemas de gestión de calidad, certificación ISO 9001',
        responsabilidades: 'Supervisar el SGC, realizar revisiones periódicas, gestionar auditorías'
      },
      {
        nombre: 'Analista de Procesos',
        departamento: 'Calidad',
        descripcion: 'Encargado de analizar y mejorar los procesos',
        nivel: 'Medio',
        requisitos: 'Conocimientos en mapeo de procesos y mejora continua',
        responsabilidades: 'Documentar procesos, proponer mejoras, analizar indicadores'
      },
      {
        nombre: 'Auditor Interno',
        departamento: 'Calidad',
        descripcion: 'Realiza auditorías internas de calidad',
        nivel: 'Medio',
        requisitos: 'Formación como auditor interno ISO 9001',
        responsabilidades: 'Planificar y ejecutar auditorías, elaborar informes'
      },
      {
        nombre: 'Documentalista SGC',
        departamento: 'Calidad',
        descripcion: 'Gestiona la documentación del sistema de calidad',
        nivel: 'Bajo',
        requisitos: 'Conocimientos en gestión documental y sistemas de calidad',
        responsabilidades: 'Controlar documentos, mantener registros actualizados'
      },
      {
        nombre: 'Director de Operaciones',
        departamento: 'Operaciones',
        descripcion: 'Responsable de todas las operaciones de la empresa',
        nivel: 'Alto',
        requisitos: 'Experiencia en dirección de operaciones y gestión de equipos',
        responsabilidades: 'Dirigir las operaciones, gestionar recursos, cumplir objetivos'
      }
    ];
    
    // Insertar datos en la tabla puestos
    for (const puesto of puestos) {
      await tursoClient.execute({
        sql: `
          INSERT INTO puestos (nombre, departamento, descripcion, nivel, requisitos, responsabilidades, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `,
        args: [
          puesto.nombre,
          puesto.departamento,
          puesto.descripcion,
          puesto.nivel,
          puesto.requisitos,
          puesto.responsabilidades
        ]
      });
    }
    
    console.log('Datos de prueba insertados en la tabla puestos correctamente');
    
    // Verificar los datos insertados
    const result = await tursoClient.execute({
      sql: 'SELECT * FROM puestos'
    });
    
    console.log(`Total de puestos insertados: ${result.rows.length}`);
    return true;
  } catch (error) {
    console.error('Error al insertar datos en la tabla puestos:', error);
    return false;
  }
}

// Ejecutar la función principal
insertPuestosData()
  .then(() => {
    console.log('Proceso completado');
  })
  .catch(error => {
    console.error('Error en el proceso principal:', error);
  });
