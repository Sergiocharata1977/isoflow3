// Script para verificar la estructura de la base de datos
import { tursoClient, executeQuery } from '../lib/tursoClient.js';

async function checkDatabase() {
  console.log('Verificando conexión a la base de datos Turso...');
  
  try {
    // Verificar la conexión
    const result = await executeQuery('SELECT sqlite_version() as version');
    console.log('Conexión exitosa. Versión SQLite:', result.data.rows[0].version);
    
    // Verificar las tablas existentes
    const tablesResult = await executeQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    console.log('\nTablas existentes:');
    if (tablesResult.data && tablesResult.data.rows.length > 0) {
      tablesResult.data.rows.forEach(row => {
        console.log(`- ${row.name}`);
      });
    } else {
      console.log('No se encontraron tablas en la base de datos.');
    }
    
    // Verificar si existen las tablas principales
    const requiredTables = ['personal', 'puestos', 'auditorias', 'hallazgos_auditoria', 'procesos'];
    console.log('\nVerificando tablas requeridas:');
    
    for (const table of requiredTables) {
      const exists = tablesResult.data.rows.some(row => row.name === table);
      console.log(`- ${table}: ${exists ? 'Existe ✅' : 'No existe ❌'}`);
      
      if (exists) {
        // Verificar estructura de la tabla
        const structureResult = await executeQuery(`PRAGMA table_info(${table})`);
        console.log(`  Columnas en ${table}:`);
        structureResult.data.rows.forEach(col => {
          console.log(`    - ${col.name} (${col.type})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error al verificar la base de datos:', error);
  }
}

// Ejecutar la función
checkDatabase();
