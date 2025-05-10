// Script para insertar datos de prueba en las tablas de documentos y normas
import { tursoClient } from '../lib/tursoClient.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function insertDocumentosData() {
  try {
    console.log('Insertando datos de prueba en documentos...');
    
    // Obtener IDs de procesos
    const procesosResult = await tursoClient.execute({
      sql: 'SELECT id, nombre FROM procesos'
    });
    
    const procesosIds = procesosResult.rows.length > 0 ? 
      procesosResult.rows.map(row => row.id) : 
      [1, 2]; // IDs por defecto si no hay procesos
    
    // Datos de prueba para documentos
    const documentos = [
      {
        codigo: 'MC-001',
        titulo: 'Manual de Calidad',
        descripcion: 'Manual principal del Sistema de Gestión de Calidad',
        tipo: 'Manual',
        version: '2.0',
        fecha_emision: '2024-01-10',
        fecha_revision: '2025-01-10',
        estado: 'Vigente',
        proceso_id: procesosIds[0],
        responsable: 'Juan Pérez',
        ruta_archivo: '/documentos/MC-001_v2.0.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        codigo: 'PR-001',
        titulo: 'Procedimiento de Control de Documentos',
        descripcion: 'Establece la metodología para el control de documentos',
        tipo: 'Procedimiento',
        version: '1.5',
        fecha_emision: '2024-02-15',
        fecha_revision: '2025-02-15',
        estado: 'Vigente',
        proceso_id: procesosIds[0],
        responsable: 'Laura Martínez',
        ruta_archivo: '/documentos/PR-001_v1.5.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        codigo: 'PR-002',
        titulo: 'Procedimiento de Auditorías Internas',
        descripcion: 'Define la metodología para realizar auditorías internas',
        tipo: 'Procedimiento',
        version: '1.2',
        fecha_emision: '2024-03-05',
        fecha_revision: '2025-03-05',
        estado: 'Vigente',
        proceso_id: procesosIds[1],
        responsable: 'Carlos Rodríguez',
        ruta_archivo: '/documentos/PR-002_v1.2.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        codigo: 'IT-001',
        titulo: 'Instructivo de Trabajo para Control de Registros',
        descripcion: 'Detalla cómo gestionar los registros del sistema',
        tipo: 'Instructivo',
        version: '1.0',
        fecha_emision: '2024-04-20',
        fecha_revision: '2025-04-20',
        estado: 'En revisión',
        proceso_id: procesosIds[0],
        responsable: 'María González',
        ruta_archivo: '/documentos/IT-001_v1.0.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const documento of documentos) {
      await tursoClient.execute({
        sql: `
          INSERT INTO documentos (codigo, titulo, descripcion, tipo, version, fecha_emision, fecha_revision, estado, proceso_id, responsable, ruta_archivo, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          documento.codigo,
          documento.titulo,
          documento.descripcion,
          documento.tipo,
          documento.version,
          documento.fecha_emision,
          documento.fecha_revision,
          documento.estado,
          documento.proceso_id,
          documento.responsable,
          documento.ruta_archivo,
          documento.created_at,
          documento.updated_at
        ]
      });
    }
    
    console.log('Datos de prueba insertados en documentos correctamente');
    
    // Obtener IDs de documentos insertados
    const documentosResult = await tursoClient.execute({
      sql: 'SELECT id, codigo FROM documentos'
    });
    
    const documentosMap = {};
    documentosResult.rows.forEach(row => {
      documentosMap[row.codigo] = row.id;
    });
    
    // Datos de prueba para revisiones de documentos
    const revisiones = [
      {
        documento_id: documentosMap['MC-001'],
        version: '1.0',
        fecha_revision: '2023-01-10',
        responsable: 'Juan Pérez',
        cambios: 'Versión inicial',
        estado: 'Obsoleta',
        created_at: new Date().toISOString()
      },
      {
        documento_id: documentosMap['MC-001'],
        version: '2.0',
        fecha_revision: '2024-01-10',
        responsable: 'Juan Pérez',
        cambios: 'Actualización completa del manual',
        estado: 'Vigente',
        created_at: new Date().toISOString()
      },
      {
        documento_id: documentosMap['PR-001'],
        version: '1.0',
        fecha_revision: '2023-02-15',
        responsable: 'Laura Martínez',
        cambios: 'Versión inicial',
        estado: 'Obsoleta',
        created_at: new Date().toISOString()
      },
      {
        documento_id: documentosMap['PR-001'],
        version: '1.5',
        fecha_revision: '2024-02-15',
        responsable: 'Laura Martínez',
        cambios: 'Actualización de formatos y responsabilidades',
        estado: 'Vigente',
        created_at: new Date().toISOString()
      }
    ];
    
    for (const revision of revisiones) {
      await tursoClient.execute({
        sql: `
          INSERT INTO revisiones_documento (documento_id, version, fecha_revision, responsable, cambios, estado, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          revision.documento_id,
          revision.version,
          revision.fecha_revision,
          revision.responsable,
          revision.cambios,
          revision.estado,
          revision.created_at
        ]
      });
    }
    
    console.log('Datos de prueba insertados en revisiones de documentos correctamente');
    
    return true;
  } catch (error) {
    console.error('Error al insertar datos de prueba en documentos:', error);
    return false;
  }
}

async function insertNormasData() {
  try {
    console.log('Insertando datos de prueba en normas...');
    
    // Datos de prueba para normas
    const normas = [
      {
        codigo: 'ISO 9001',
        titulo: 'Sistemas de Gestión de Calidad - Requisitos',
        descripcion: 'Norma internacional que especifica los requisitos para un sistema de gestión de calidad',
        version: '2015',
        organismo: 'ISO',
        fecha_publicacion: '2015-09-15',
        estado: 'Vigente',
        ruta_archivo: '/normas/ISO9001_2015.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        codigo: 'ISO 14001',
        titulo: 'Sistemas de Gestión Ambiental - Requisitos',
        descripcion: 'Norma internacional que especifica los requisitos para un sistema de gestión ambiental',
        version: '2015',
        organismo: 'ISO',
        fecha_publicacion: '2015-09-15',
        estado: 'Vigente',
        ruta_archivo: '/normas/ISO14001_2015.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        codigo: 'ISO 45001',
        titulo: 'Sistemas de Gestión de Seguridad y Salud en el Trabajo - Requisitos',
        descripcion: 'Norma internacional que especifica los requisitos para un sistema de gestión de seguridad y salud en el trabajo',
        version: '2018',
        organismo: 'ISO',
        fecha_publicacion: '2018-03-12',
        estado: 'Vigente',
        ruta_archivo: '/normas/ISO45001_2018.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const norma of normas) {
      await tursoClient.execute({
        sql: `
          INSERT INTO normas (codigo, titulo, descripcion, version, organismo, fecha_publicacion, estado, ruta_archivo, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          norma.codigo,
          norma.titulo,
          norma.descripcion,
          norma.version,
          norma.organismo,
          norma.fecha_publicacion,
          norma.estado,
          norma.ruta_archivo,
          norma.created_at,
          norma.updated_at
        ]
      });
    }
    
    console.log('Datos de prueba insertados en normas correctamente');
    
    // Obtener IDs de normas insertadas
    const normasResult = await tursoClient.execute({
      sql: 'SELECT id, codigo FROM normas'
    });
    
    const normasMap = {};
    normasResult.rows.forEach(row => {
      normasMap[row.codigo] = row.id;
    });
    
    // Obtener IDs de procesos
    const procesosResult = await tursoClient.execute({
      sql: 'SELECT id, nombre FROM procesos'
    });
    
    const procesosIds = procesosResult.rows.length > 0 ? 
      procesosResult.rows.map(row => row.id) : 
      [1, 2]; // IDs por defecto si no hay procesos
    
    // Datos de prueba para requisitos de norma
    const requisitos = [
      {
        norma_id: normasMap['ISO 9001'],
        numero: '4.1',
        descripcion: 'Comprensión de la organización y su contexto',
        proceso_id: procesosIds[0],
        responsable: 'Juan Pérez',
        estado_cumplimiento: 'Cumple',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        norma_id: normasMap['ISO 9001'],
        numero: '4.2',
        descripcion: 'Comprensión de las necesidades y expectativas de las partes interesadas',
        proceso_id: procesosIds[0],
        responsable: 'Juan Pérez',
        estado_cumplimiento: 'Cumple parcialmente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        norma_id: normasMap['ISO 9001'],
        numero: '7.5',
        descripcion: 'Información documentada',
        proceso_id: procesosIds[1],
        responsable: 'Laura Martínez',
        estado_cumplimiento: 'Cumple',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        norma_id: normasMap['ISO 14001'],
        numero: '6.1.2',
        descripcion: 'Aspectos ambientales',
        proceso_id: procesosIds[1],
        responsable: 'Roberto Sánchez',
        estado_cumplimiento: 'En implementación',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const requisito of requisitos) {
      await tursoClient.execute({
        sql: `
          INSERT INTO requisitos_norma (norma_id, numero, descripcion, proceso_id, responsable, estado_cumplimiento, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          requisito.norma_id,
          requisito.numero,
          requisito.descripcion,
          requisito.proceso_id,
          requisito.responsable,
          requisito.estado_cumplimiento,
          requisito.created_at,
          requisito.updated_at
        ]
      });
    }
    
    console.log('Datos de prueba insertados en requisitos de norma correctamente');
    
    return true;
  } catch (error) {
    console.error('Error al insertar datos de prueba en normas:', error);
    return false;
  }
}

// Ejecutar la función principal
async function main() {
  try {
    console.log('Iniciando inserción de datos de prueba en documentos y normas...');
    console.log('URL de la base de datos:', process.env.TURSO_DATABASE_URL);
    
    await insertDocumentosData();
    await insertNormasData();
    
    console.log('Proceso completado correctamente');
    
    // Consultar datos insertados para verificar
    const documentosResult = await tursoClient.execute({
      sql: 'SELECT * FROM documentos'
    });
    console.log(`Total de documentos: ${documentosResult.rows.length}`);
    
    const revisionesResult = await tursoClient.execute({
      sql: 'SELECT * FROM revisiones_documento'
    });
    console.log(`Total de revisiones: ${revisionesResult.rows.length}`);
    
    const normasResult = await tursoClient.execute({
      sql: 'SELECT * FROM normas'
    });
    console.log(`Total de normas: ${normasResult.rows.length}`);
    
    const requisitosResult = await tursoClient.execute({
      sql: 'SELECT * FROM requisitos_norma'
    });
    console.log(`Total de requisitos: ${requisitosResult.rows.length}`);
    
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

main();
