import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as services from '../services';
import { executeQuery } from '../lib/tursoClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as cacheService from '../lib/cacheService';
import documentosService from '../services/documentosService';

// Crear el contexto
const TursoContext = createContext();

// Hook personalizado para usar el contexto
export const useTurso = () => useContext(TursoContext);

// Proveedor del contexto
export const TursoProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionAttempted, setConnectionAttempted] = useState(false);

  // Verificar la conexión a la base de datos al cargar el componente
  const checkConnectionQuery = useQuery({
    queryKey: ['dbConnection'],
    queryFn: async () => {
      if (connectionAttempted) return { connected: dbConnected };
      
      try {
        setConnectionAttempted(true);
        console.log('Verificando conexión a la base de datos Turso...');
        
        // Intentar ejecutar una consulta simple para verificar la conexión
        const result = await executeQuery('SELECT sqlite_version() as version');
        
        if (result.data && result.data.rows && result.data.rows.length > 0) {
          console.log('Conexión exitosa a Turso. Versión SQLite:', result.data.rows[0].version);
          setDbConnected(true);
          
          // Verificar tablas existentes
          try {
            const tablesResult = await executeQuery(`
              SELECT name FROM sqlite_master 
              WHERE type='table' 
              ORDER BY name
            `);
            
            if (tablesResult.data && tablesResult.data.rows && tablesResult.data.rows.length > 0) {
              console.log('Tablas disponibles:', tablesResult.data.rows.map(row => row.name).join(', '));
            } else {
              console.warn('No se encontraron tablas en la base de datos');
            }
          } catch (tablesError) {
            console.error('Error al consultar las tablas:', tablesError);
          }
          
          return { connected: true, version: result.data.rows[0].version };
        } else {
          console.error('Error al conectar con la base de datos:', result.error);
          const errorMsg = 'Error al conectar con la base de datos (respuesta incompleta). Verifica tu conexión a internet y las credenciales.';
          setError(errorMsg);
          setDbConnected(false);
          return { connected: false, error: errorMsg };
        }
      } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
        const errorMsg = `Error al conectar con la base de datos: ${err.message || 'Error desconocido'}. Verifica tu conexión a internet y las credenciales.`;
        setError(errorMsg);
        setDbConnected(false);
        return { connected: false, error: err };
      }
    },
    onSuccess: (data) => {
      setDbConnected(data.connected);
      if (!data.connected) {
        const errorMsg = data.error?.message || 'Error desconocido al conectar con la base de datos';
        setError(`Error al conectar con la base de datos: ${errorMsg}. Verifica tu conexión a internet y las credenciales.`);
      } else {
        setError(null);
      }
    },
    onError: (err) => {
      console.error('Error en la consulta de conexión:', err);
      setDbConnected(false);
      setError(`Error en la consulta de conexión: ${err.message || 'Error desconocido'}. Verifica tu conexión a internet y las credenciales.`);
    },
    // No refrescar automáticamente, solo una vez al inicio
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    retry: 2, // Intentar la conexión hasta 3 veces (1 intento inicial + 2 reintentos)
    retryDelay: 1000 // Esperar 1 segundo entre reintentos
  });

  // Función genérica para manejar peticiones a la API con caché
  const handleRequest = useCallback(async (requestFn, ...args) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Ejecutando petición: ${requestFn.name || 'anónima'} con args:`, args);
      
      // Generar una clave única para la caché
      const fnName = requestFn.name || 'anonymous';
      const isReadOperation = fnName.startsWith('get') || fnName.startsWith('find') || fnName.startsWith('list');
      
      // Si es una operación de lectura, intentar usar la caché
      if (isReadOperation) {
        const cacheKey = `${fnName}_${JSON.stringify(args)}`;
        return await cacheService.getOrSet(cacheKey, async () => {
          const result = await requestFn(...args);
          console.log(`Resultado de petición ${fnName}:`, result);
          return result;
        });
      } else {
        // Para operaciones de escritura, ejecutar directamente e invalidar consultas relacionadas
        const result = await requestFn(...args);
        console.log(`Resultado de petición ${fnName}:`, result);
        
        // Determinar qué consultas invalidar basado en el nombre de la función
        let invalidatePattern = '';
        
        if (fnName.includes('Personal')) {
          invalidatePattern = 'Personal';
        } else if (fnName.includes('Auditoria')) {
          invalidatePattern = 'Auditoria';
        } else if (fnName.includes('Documento')) {
          invalidatePattern = 'Documento';
        } else if (fnName.includes('Norma')) {
          invalidatePattern = 'Norma';
        }
        
        if (invalidatePattern) {
          // Invalidar consultas relacionadas
          queryClient.invalidateQueries({ queryKey: [invalidatePattern] });
          
          // Limpiar caché relacionada
          Object.keys(cacheService).forEach(key => {
            if (key.includes(invalidatePattern.toLowerCase())) {
              cacheService.remove(key);
            }
          });
        }
        
        return result;
      }
    } catch (err) {
      console.error('Error en la petición:', err);
      setError(err.message || 'Error en la petición a la base de datos');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  // Crear versiones de los servicios que utilizan React Query
  const createQueryService = (service, serviceName) => {
    const enhancedService = {};
    
    // Recorrer todas las funciones del servicio
    Object.keys(service).forEach(fnName => {
      const originalFn = service[fnName];
      
      // Si es una función, mejorarla
      if (typeof originalFn === 'function') {
        // Determinar si es una operación de lectura o escritura
        const isReadOperation = fnName.startsWith('get') || fnName.startsWith('find') || fnName.startsWith('list');
        
        if (isReadOperation) {
          // Para operaciones de lectura, crear un hook personalizado
          enhancedService[fnName] = (...args) => {
            const queryKey = [serviceName, fnName, ...args];
            
            return useQuery({
              queryKey,
              queryFn: () => originalFn(...args),
              staleTime: 5 * 60 * 1000, // 5 minutos
              cacheTime: 10 * 60 * 1000, // 10 minutos
              onError: (err) => {
                console.error(`Error en ${serviceName}.${fnName}:`, err);
                setError(`Error al cargar datos: ${err.message}`);
              }
            });
          };
        } else {
          // Para operaciones de escritura, crear una mutación
          enhancedService[fnName] = (...args) => {
            return useMutation({
              mutationFn: () => originalFn(...args),
              onSuccess: () => {
                // Invalidar consultas relacionadas
                queryClient.invalidateQueries({ queryKey: [serviceName] });
                
                // Limpiar caché relacionada
                Object.keys(cacheService).forEach(key => {
                  if (key.includes(serviceName.toLowerCase())) {
                    cacheService.remove(key);
                  }
                });
              },
              onError: (err) => {
                console.error(`Error en ${serviceName}.${fnName}:`, err);
                setError(`Error al guardar datos: ${err.message}`);
              }
            });
          };
        }
        
        // Mantener la función original también
        enhancedService[`${fnName}Original`] = originalFn;
      }
    });
    
    return enhancedService;
  };

  // Crear versiones mejoradas de los servicios
  const enhancedServices = {
    personalService: createQueryService(services.personalService, 'Personal'),
    auditoriasService: createQueryService(services.auditoriasService, 'Auditorias'),
    documentosService: createQueryService(documentosService, 'Documentos')
  };

  // Valor del contexto
  const value = {
    isLoading,
    error,
    dbConnected,
    services,
    handleRequest,
    // Servicios específicos (originales)
    personalService: services.personalService,
    auditoriasService: services.auditoriasService,
    documentosService,
    // Servicios mejorados con React Query
    personalQueryService: enhancedServices.personalService,
    auditoriasQueryService: enhancedServices.auditoriasService,
    documentosQueryService: enhancedServices.documentosService,
    // Función para limpiar errores
    clearError: () => setError(null),
    // Función para limpiar caché
    clearCache: () => {
      cacheService.clear();
      queryClient.clear();
    }
  };

  return (
    <TursoContext.Provider value={value}>
      {children}
    </TursoContext.Provider>
  );
};

export default TursoContext;
