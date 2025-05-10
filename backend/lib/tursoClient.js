// Módulo para centralizar la conexión a la base de datos Turso
import { createClient } from '@libsql/client';

// Leer credenciales desde las variables de entorno
const dbUrl = process.env.VITE_TURSO_DATABASE_URL;
const authToken = process.env.VITE_TURSO_AUTH_TOKEN;

// Verificar que las variables de entorno estén definidas
if (!dbUrl || !authToken) {
  console.error('Error: Variables de entorno VITE_TURSO_DATABASE_URL o VITE_TURSO_AUTH_TOKEN no definidas.');
  process.exit(1);
}

// Crear y exportar el cliente Turso
export const tursoClient = createClient({
  url: dbUrl,
  authToken: authToken,
});

// Función de utilidad para ejecutar consultas SQL
export async function executeQuery(query, params = []) {
  try {
    const result = await tursoClient.execute({ sql: query, args: params });
    return { data: result, error: null };
  } catch (error) {
    console.error('Error al ejecutar consulta SQL:', error);
    return { data: null, error };
  }
}

// Función para verificar la conexión a la base de datos
export async function testConnection() {
  try {
    const result = await executeQuery('SELECT sqlite_version() as version');
    if (result.data) {
      console.log('Conexión a la base de datos Turso establecida correctamente');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al conectar con la base de datos Turso:', error);
    return false;
  }
}

// Exportar funciones y cliente para uso en otros módulos
export default {
  tursoClient,
  executeQuery,
  testConnection
};
