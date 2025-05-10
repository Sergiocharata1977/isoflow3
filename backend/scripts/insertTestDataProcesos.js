// Script para insertar datos de prueba en procesos e indicadores
import { tursoClient } from '../lib/tursoClient.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function insertProcesosData() {
  try {
    console.log('Insertando datos de prueba en procesos...');
    
    // Datos de prueba para procesos
    const procesos = [
      {
        nombre: 'Gestión de Calidad',
        codigo: 'GC-01',
        version: '1.0',
        responsable: 'Juan Pérez',
        descripcion: 'Proceso encargado de mantener y mejorar el sistema de gestión de calidad'
      },
      {
        nombre: 'Auditorías Internas',
        codigo: 'AI-01',
        version: '1.0',
        responsable: 'Carlos Rodríguez',
        descripcion: 'Proceso para la planificación y ejecución de auditorías internas'
      },
      {
        nombre: 'Gestión Documental',
        codigo: 'GD-01',
        version: '1.0',
        responsable: 'Laura Martínez',
        descripcion: 'Proceso para el control y gestión de documentos y registros'
      },
      {
        nombre: 'Mejora Continua',
        codigo: 'MC-01',
        version: '1.0',
        responsable: 'María González',
        descripcion: 'Proceso para la identificación e implementación de mejoras'
      },
      {
        nombre: 'Gestión de Recursos Humanos',
        codigo: 'RH-01',
        version: '1.0',
        responsable: 'Roberto Sánchez',
        descripcion: 'Proceso para la gestión del personal y competencias'
      }
    ];
    
    for (const proceso of procesos) {
      await tursoClient.execute({
        sql: `
          INSERT INTO procesos (nombre, codigo, version, responsable, descripcion)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [
          proceso.nombre,
          proceso.codigo,
          proceso.version,
          proceso.responsable,
          proceso.descripcion
        ]
      });
    }
    
    console.log('Datos de prueba insertados en procesos correctamente');
    
    // Obtener IDs de procesos insertados
    const procesosResult = await tursoClient.execute({
      sql: 'SELECT id, nombre FROM procesos'
    });
    
    const procesosMap = {};
    procesosResult.rows.forEach(row => {
      procesosMap[row.nombre] = row.id;
    });
    
    // Datos de prueba para indicadores
    const indicadores = [
      {
        nombre: 'Porcentaje de No Conformidades Cerradas',
        descripcion: 'Mide el porcentaje de no conformidades que han sido cerradas en el período',
        formula: '(No. NC Cerradas / No. NC Totales) * 100',
        unidad: '%',
        meta: 90,
        proceso_id: procesosMap['Gestión de Calidad']
      },
      {
        nombre: 'Cumplimiento del Programa de Auditorías',
        descripcion: 'Mide el porcentaje de auditorías realizadas respecto a las planificadas',
        formula: '(No. Auditorías Realizadas / No. Auditorías Planificadas) * 100',
        unidad: '%',
        meta: 100,
        proceso_id: procesosMap['Auditorías Internas']
      },
      {
        nombre: 'Tiempo Promedio de Actualización Documental',
        descripcion: 'Mide el tiempo promedio que toma actualizar un documento',
        formula: 'Suma de días de actualización / No. de documentos actualizados',
        unidad: 'días',
        meta: 5,
        proceso_id: procesosMap['Gestión Documental']
      },
      {
        nombre: 'Número de Mejoras Implementadas',
        descripcion: 'Cantidad de mejoras implementadas en el período',
        formula: 'Suma de mejoras implementadas',
        unidad: 'unidades',
        meta: 10,
        proceso_id: procesosMap['Mejora Continua']
      },
      {
        nombre: 'Índice de Rotación de Personal',
        descripcion: 'Mide la rotación del personal en el período',
        formula: '((Altas + Bajas) / 2) / Total de empleados * 100',
        unidad: '%',
        meta: 5,
        proceso_id: procesosMap['Gestión de Recursos Humanos']
      }
    ];
    
    for (const indicador of indicadores) {
      await tursoClient.execute({
        sql: `
          INSERT INTO indicadores_proceso (nombre, descripcion, formula, unidad, meta, proceso_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          indicador.nombre,
          indicador.descripcion,
          indicador.formula,
          indicador.unidad,
          indicador.meta,
          indicador.proceso_id
        ]
      });
    }
    
    console.log('Datos de prueba insertados en indicadores correctamente');
    
    return true;
  } catch (error) {
    console.error('Error al insertar datos de prueba en procesos:', error);
    return false;
  }
}

// Ejecutar la función principal
async function main() {
  try {
    console.log('Iniciando inserción de datos de prueba en procesos e indicadores...');
    console.log('URL de la base de datos:', process.env.TURSO_DATABASE_URL);
    
    await insertProcesosData();
    
    console.log('Proceso completado correctamente');
    
    // Consultar datos insertados para verificar
    const procesosResult = await tursoClient.execute({
      sql: 'SELECT * FROM procesos'
    });
    console.log(`Total de procesos: ${procesosResult.rows.length}`);
    
    const indicadoresResult = await tursoClient.execute({
      sql: 'SELECT * FROM indicadores_proceso'
    });
    console.log(`Total de indicadores de proceso: ${indicadoresResult.rows.length}`);
    
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

main();
