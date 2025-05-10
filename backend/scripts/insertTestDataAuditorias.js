// Script para insertar datos de prueba en las tablas de auditorías
import { tursoClient } from '../lib/tursoClient.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function insertAuditoriasData() {
  try {
    console.log('Insertando datos de prueba en auditorías...');
    
    // Datos de prueba para auditorías
    const auditorias = [
      {
        titulo: 'Auditoría Interna ISO 9001',
        tipo: 'Interna',
        fecha_inicio: '2025-01-15',
        fecha_fin: '2025-01-20',
        responsable: 'Carlos Rodríguez',
        estado: 'Completada',
        resultado: 'Conforme con observaciones',
        observaciones: 'Se detectaron 3 no conformidades menores',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        titulo: 'Auditoría Externa de Certificación',
        tipo: 'Externa',
        fecha_inicio: '2025-02-10',
        fecha_fin: '2025-02-15',
        responsable: 'Bureau Veritas',
        estado: 'Completada',
        resultado: 'Certificación aprobada',
        observaciones: 'Se recomienda mejorar la gestión documental',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        titulo: 'Auditoría de Seguimiento',
        tipo: 'Interna',
        fecha_inicio: '2025-03-05',
        fecha_fin: null,
        responsable: 'Juan Pérez',
        estado: 'En proceso',
        resultado: null,
        observaciones: 'Enfocada en procesos operativos',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const auditoria of auditorias) {
      const result = await tursoClient.execute({
        sql: `
          INSERT INTO auditorias (titulo, tipo, fecha_inicio, fecha_fin, responsable, estado, resultado, observaciones, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          auditoria.titulo,
          auditoria.tipo,
          auditoria.fecha_inicio,
          auditoria.fecha_fin,
          auditoria.responsable,
          auditoria.estado,
          auditoria.resultado,
          auditoria.observaciones,
          auditoria.created_at,
          auditoria.updated_at
        ]
      });
    }
    
    console.log('Datos de prueba insertados en auditorías correctamente');
    
    // Obtener IDs de auditorías insertadas
    const auditoriasResult = await tursoClient.execute({
      sql: 'SELECT id, titulo FROM auditorias'
    });
    
    const auditoriasMap = {};
    auditoriasResult.rows.forEach(row => {
      auditoriasMap[row.titulo] = row.id;
    });
    
    // Obtener IDs de procesos
    const procesosResult = await tursoClient.execute({
      sql: 'SELECT id, nombre FROM procesos'
    });
    
    const procesosIds = procesosResult.rows.length > 0 ? 
      procesosResult.rows.map(row => row.id) : 
      [1, 2]; // IDs por defecto si no hay procesos
    
    // Datos de prueba para hallazgos de auditoría
    const hallazgos = [
      {
        auditoria_id: auditoriasMap['Auditoría Interna ISO 9001'],
        descripcion: 'Falta de registros de capacitación',
        tipo: 'No conformidad menor',
        proceso_id: procesosIds[0],
        responsable: 'María González',
        fecha_deteccion: '2025-01-16',
        estado: 'Cerrado',
        accion_correctiva: 'Implementar sistema de registro digital de capacitaciones',
        fecha_cierre: '2025-02-10',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        auditoria_id: auditoriasMap['Auditoría Interna ISO 9001'],
        descripcion: 'Documentación de procesos desactualizada',
        tipo: 'No conformidad menor',
        proceso_id: procesosIds[1],
        responsable: 'Roberto Sánchez',
        fecha_deteccion: '2025-01-17',
        estado: 'En proceso',
        accion_correctiva: 'Actualizar manual de procedimientos',
        fecha_cierre: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        auditoria_id: auditoriasMap['Auditoría Externa de Certificación'],
        descripcion: 'Control de documentos ineficiente',
        tipo: 'Observación',
        proceso_id: procesosIds[0],
        responsable: 'Laura Martínez',
        fecha_deteccion: '2025-02-12',
        estado: 'Cerrado',
        accion_correctiva: 'Implementar sistema de gestión documental',
        fecha_cierre: '2025-03-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const hallazgo of hallazgos) {
      await tursoClient.execute({
        sql: `
          INSERT INTO hallazgos_auditoria (auditoria_id, descripcion, tipo, proceso_id, responsable, fecha_deteccion, estado, accion_correctiva, fecha_cierre, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          hallazgo.auditoria_id,
          hallazgo.descripcion,
          hallazgo.tipo,
          hallazgo.proceso_id,
          hallazgo.responsable,
          hallazgo.fecha_deteccion,
          hallazgo.estado,
          hallazgo.accion_correctiva,
          hallazgo.fecha_cierre,
          hallazgo.created_at,
          hallazgo.updated_at
        ]
      });
    }
    
    console.log('Datos de prueba insertados en hallazgos de auditoría correctamente');
    
    return true;
  } catch (error) {
    console.error('Error al insertar datos de prueba en auditorías:', error);
    return false;
  }
}

// Ejecutar la función principal
async function main() {
  try {
    console.log('Iniciando inserción de datos de prueba en auditorías...');
    console.log('URL de la base de datos:', process.env.TURSO_DATABASE_URL);
    
    await insertAuditoriasData();
    
    console.log('Proceso completado correctamente');
    
    // Consultar datos insertados para verificar
    const auditoriasResult = await tursoClient.execute({
      sql: 'SELECT * FROM auditorias'
    });
    console.log(`Total de auditorías: ${auditoriasResult.rows.length}`);
    
    const hallazgosResult = await tursoClient.execute({
      sql: 'SELECT * FROM hallazgos_auditoria'
    });
    console.log(`Total de hallazgos: ${hallazgosResult.rows.length}`);
    
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

main();
