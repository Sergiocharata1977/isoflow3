// Configuración del cliente de Turso
import { createClient } from '@libsql/client';
import * as cacheService from './cacheService';

// Determinar el entorno (Vite o Node)
const isViteEnv = typeof import.meta !== 'undefined' && import.meta.env;

// Crear el cliente de Turso
export const tursoClient = createClient({
  url: isViteEnv 
    ? import.meta.env.VITE_TURSO_DATABASE_URL || 'libsql://iso-muestra-104-sergiocharata1977.aws-us-east-1.turso.io'
    : 'libsql://iso-muestra-104-sergiocharata1977.aws-us-east-1.turso.io',
  authToken: isViteEnv 
    ? import.meta.env.VITE_TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ'
    : 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ',

  // Logs para depuración
  onConnect: () => console.log('Conectado a la base de datos Turso:', isViteEnv ? import.meta.env.VITE_TURSO_DATABASE_URL : 'usando valor predeterminado')
});

/**
 * Ejecuta una consulta SQL en la base de datos Turso
 * @param {string} query - Consulta SQL a ejecutar
 * @param {Array} params - Parámetros para la consulta (opcional)
 * @returns {Promise<Object>} - Resultado de la consulta o error
 */
export async function executeQuery(query, params = []) {
  console.log('Ejecutando consulta:', query);
  
  // Generar una clave única para la caché basada en la consulta y los parámetros
  // Solo para consultas SELECT (lectura)
  const isReadQuery = query.trim().toLowerCase().startsWith('select');
  const cacheKey = isReadQuery ? `turso_${query}_${JSON.stringify(params)}` : null;
  
  try {
    // Si es una consulta de lectura, intentar obtener de la caché
    if (isReadQuery && cacheKey) {
      return await cacheService.getOrSet(
        cacheKey,
        async () => {
          const result = await tursoClient.execute({ sql: query, args: params });
          return { data: result, error: null };
        }
      );
    } else {
      // Para consultas de escritura, ejecutar directamente y limpiar caché relacionada
      const result = await tursoClient.execute({ sql: query, args: params });
      
      // Si es una consulta de escritura (INSERT, UPDATE, DELETE), invalidar caché relacionada
      if (!isReadQuery) {
        // Extraer el nombre de la tabla de la consulta
        const tableMatch = query.match(/\b(from|into|update|table)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
        if (tableMatch && tableMatch[2]) {
          const tableName = tableMatch[2].toLowerCase();
          console.log(`Invalidando caché para tabla: ${tableName}`);
          
          // Eliminar todas las entradas de caché relacionadas con esta tabla
          Object.keys(cacheService).forEach(key => {
            if (key.includes(tableName)) {
              cacheService.remove(key);
            }
          });
        }
      }
      
      return { data: result, error: null };
    }
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    return { data: null, error };
  }
}

export default tursoClient;
