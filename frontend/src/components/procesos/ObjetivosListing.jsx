import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@libsql/client";
import { 
  Plus, 
  Search, 
  Download, 
  Pencil, 
  Trash2, 
  Target,
  ArrowLeft,
  ChevronRight,
  Activity
} from "lucide-react";
import ObjetivoModal from "./ObjetivoModal";
import IndicadoresListing from "./IndicadoresListing";

// Cliente de Turso
const client = createClient({
  url: "libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ"
});

function ObjetivosListing({ procesoId, procesoNombre, onBack }) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObjetivo, setSelectedObjetivo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [objetivos, setObjetivos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showIndicadores, setShowIndicadores] = useState(false);
  const [currentObjetivo, setCurrentObjetivo] = useState(null);

  useEffect(() => {
    loadObjetivos();
  }, [procesoId]);

  const loadObjetivos = async () => {
    try {
      setIsLoading(true);
      
      // Intentar cargar desde Turso
      try {
        let query = "SELECT * FROM objetivos";
        let args = [];
        
        if (procesoId) {
          query += " WHERE proceso_id = ?";
          args.push(procesoId);
        }
        
        const result = await client.execute({
          sql: query,
          args: args
        });
        
        if (result.rows.length > 0) {
          setObjetivos(result.rows);
          setIsLoading(false);
          return;
        }
      } catch (dbError) {
        console.error("Error al cargar desde Turso:", dbError);
      }
      
      // Intentar cargar desde localStorage
      const saved = localStorage.getItem("objetivos");
      let data = saved ? JSON.parse(saved) : [];
      
      // Si hay datos en localStorage, intentar sincronizarlos con Turso
      if (data.length > 0) {
        try {
          for (const objetivo of data) {
            await client.execute({
              sql: `INSERT OR REPLACE INTO objetivos 
                    (id, titulo, descripcion, responsable, proceso_id, proceso_nombre, 
                     meta, fecha_inicio, fecha_fin, estado) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                objetivo.id, 
                objetivo.titulo, 
                objetivo.descripcion || '', 
                objetivo.responsable || '', 
                objetivo.proceso_id || null, 
                objetivo.proceso_nombre || '', 
                objetivo.meta || '', 
                objetivo.fecha_inicio || '', 
                objetivo.fecha_fin || '', 
                objetivo.estado || ''
              ]
            });
          }
          
          // Recargar desde Turso después de sincronizar
          let query = "SELECT * FROM objetivos";
          let args = [];
          
          if (procesoId) {
            query += " WHERE proceso_id = ?";
            args.push(procesoId);
          }
          
          const syncResult = await client.execute({
            sql: query,
            args: args
          });
          
          if (syncResult.rows.length > 0) {
            setObjetivos(syncResult.rows);
          } else {
            // Filtrar objetivos por proceso si se proporciona un procesoId
            const filteredData = procesoId ? data.filter(obj => obj.proceso_id === procesoId) : data;
            setObjetivos(filteredData);
          }
        } catch (syncError) {
          console.error("Error al sincronizar con Turso:", syncError);
          // Filtrar objetivos por proceso si se proporciona un procesoId
          const filteredData = procesoId ? data.filter(obj => obj.proceso_id === procesoId) : data;
          setObjetivos(filteredData);
        }
      } else if (data.length === 0) {
        // Si no hay datos, crear datos de muestra
        const mockData = [
          {
            id: 1,
            titulo: "Reducir tiempos de producción",
            descripcion: "Reducir los tiempos de producción en un 15% para el final del año",
            responsable: "Juan Pérez",
            proceso_id: 1,
            proceso_nombre: "Gestión de Producción",
            meta: "15% de reducción",
            fecha_inicio: "2025-01-01",
            fecha_fin: "2025-12-31",
            estado: "En progreso"
          },
          {
            id: 2,
            titulo: "Mejorar calidad de productos",
            descripcion: "Reducir las no conformidades en un 20% a través de mejoras en el proceso de control de calidad",
            responsable: "María López",
            proceso_id: 1,
            proceso_nombre: "Gestión de Producción",
            meta: "20% menos no conformidades",
            fecha_inicio: "2025-02-01",
            fecha_fin: "2025-11-30",
            estado: "En progreso"
          },
          {
            id: 3,
            titulo: "Optimizar proceso de compras",
            descripcion: "Reducir el tiempo de adquisición de materiales en un 25%",
            responsable: "Carlos Rodríguez",
            proceso_id: 2,
            proceso_nombre: "Gestión de Compras",
            meta: "25% de reducción en tiempos",
            fecha_inicio: "2025-01-15",
            fecha_fin: "2025-10-15",
            estado: "Planificado"
          },
          {
            id: 4,
            titulo: "Implementar sistema de gestión documental",
            descripcion: "Digitalizar el 100% de la documentación del SGC",
            responsable: "Ana Martínez",
            proceso_id: 3,
            proceso_nombre: "Gestión de Calidad",
            meta: "100% documentación digital",
            fecha_inicio: "2025-03-01",
            fecha_fin: "2025-09-30",
            estado: "En progreso"
          }
        ];
        
        try {
          // Intentar guardar los datos de muestra en Turso
          for (const objetivo of mockData) {
            await client.execute({
              sql: `INSERT OR REPLACE INTO objetivos 
                    (id, titulo, descripcion, responsable, proceso_id, proceso_nombre, 
                     meta, fecha_inicio, fecha_fin, estado) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                objetivo.id, 
                objetivo.titulo, 
                objetivo.descripcion || '', 
                objetivo.responsable || '', 
                objetivo.proceso_id || null, 
                objetivo.proceso_nombre || '', 
                objetivo.meta || '', 
                objetivo.fecha_inicio || '', 
                objetivo.fecha_fin || '', 
                objetivo.estado || ''
              ]
            });
          }
          
          // Guardar en localStorage como respaldo
          localStorage.setItem("objetivos", JSON.stringify(mockData));
          
          // Filtrar objetivos por proceso si se proporciona un procesoId
          const filteredMockData = procesoId ? mockData.filter(obj => obj.proceso_id === procesoId) : mockData;
          setObjetivos(filteredMockData);
        } catch (mockError) {
          console.error("Error al guardar datos de muestra en Turso:", mockError);
          // Si falla, usar los datos de muestra directamente
          localStorage.setItem("objetivos", JSON.stringify(mockData));
          // Filtrar objetivos por proceso si se proporciona un procesoId
          const filteredMockData = procesoId ? mockData.filter(obj => obj.proceso_id === procesoId) : mockData;
          setObjetivos(filteredMockData);
        }
      } else {
        setObjetivos([]);
      }
    } catch (error) {
      console.error("Error loading objetivos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los objetivos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (objetivoData) => {
    try {
      let updatedObjetivos;
      const newId = selectedObjetivo ? selectedObjetivo.id : Date.now();
      const newObjetivo = { 
        ...objetivoData, 
        id: newId,
        proceso_id: procesoId,
        proceso_nombre: procesoNombre
      };
      
      // Intentar guardar en Turso
      try {
        await client.execute({
          sql: `INSERT OR REPLACE INTO objetivos 
                (id, titulo, descripcion, responsable, proceso_id, proceso_nombre, 
                 meta, fecha_inicio, fecha_fin, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            newObjetivo.id, 
            newObjetivo.titulo, 
            newObjetivo.descripcion || '', 
            newObjetivo.responsable || '', 
            newObjetivo.proceso_id || null, 
            newObjetivo.proceso_nombre || '', 
            newObjetivo.meta || '', 
            newObjetivo.fecha_inicio || '', 
            newObjetivo.fecha_fin || '', 
            newObjetivo.estado || ''
          ]
        });
        
        // Recargar objetivos desde Turso
        let query = "SELECT * FROM objetivos";
        let args = [];
        
        if (procesoId) {
          query += " WHERE proceso_id = ?";
          args.push(procesoId);
        }
        
        const result = await client.execute({
          sql: query,
          args: args
        });
        
        if (result.rows.length > 0) {
          updatedObjetivos = result.rows;
          
          // Actualizar localStorage como respaldo
          const saved = localStorage.getItem("objetivos");
          let allObjetivos = saved ? JSON.parse(saved) : [];
          
          if (selectedObjetivo) {
            allObjetivos = allObjetivos.map(obj => 
              obj.id === selectedObjetivo.id ? newObjetivo : obj
            );
          } else {
            allObjetivos.push(newObjetivo);
          }
          
          localStorage.setItem("objetivos", JSON.stringify(allObjetivos));
        }
      } catch (dbError) {
        console.error("Error al guardar en Turso:", dbError);
        
        // Fallback a localStorage
        const saved = localStorage.getItem("objetivos");
        let allObjetivos = saved ? JSON.parse(saved) : [];
        
        if (selectedObjetivo) {
          allObjetivos = allObjetivos.map(obj => 
            obj.id === selectedObjetivo.id ? newObjetivo : obj
          );
          updatedObjetivos = objetivos.map(obj => 
            obj.id === selectedObjetivo.id ? newObjetivo : obj
          );
        } else {
          allObjetivos.push(newObjetivo);
          updatedObjetivos = [...objetivos, newObjetivo];
        }
        
        localStorage.setItem("objetivos", JSON.stringify(allObjetivos));
      }
      
      setObjetivos(updatedObjetivos);
      setIsModalOpen(false);
      setSelectedObjetivo(null);
      
      toast({
        title: selectedObjetivo ? "Objetivo actualizado" : "Objetivo creado",
        description: selectedObjetivo 
          ? "Los datos del objetivo han sido actualizados exitosamente" 
          : "Se ha agregado un nuevo objetivo exitosamente"
      });
    } catch (error) {
      console.error("Error al guardar objetivo:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el objetivo",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (objetivo) => {
    setSelectedObjetivo(objetivo);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      // Intentar eliminar de Turso
      try {
        await client.execute({
          sql: "DELETE FROM objetivos WHERE id = ?",
          args: [id]
        });
        
        // Recargar objetivos desde Turso
        let query = "SELECT * FROM objetivos";
        let args = [];
        
        if (procesoId) {
          query += " WHERE proceso_id = ?";
          args.push(procesoId);
        }
        
        const result = await client.execute({
          sql: query,
          args: args
        });
        
        setObjetivos(result.rows);
        
        // Actualizar localStorage como respaldo
        const saved = localStorage.getItem("objetivos");
        if (saved) {
          const allObjetivos = JSON.parse(saved).filter(obj => obj.id !== id);
          localStorage.setItem("objetivos", JSON.stringify(allObjetivos));
        }
      } catch (dbError) {
        console.error("Error al eliminar de Turso:", dbError);
        
        // Fallback a localStorage
        const saved = localStorage.getItem("objetivos");
        if (saved) {
          const allObjetivos = JSON.parse(saved).filter(obj => obj.id !== id);
          localStorage.setItem("objetivos", JSON.stringify(allObjetivos));
          
          // Actualizar el estado local
          setObjetivos(objetivos.filter(obj => obj.id !== id));
        }
      }
      
      toast({
        title: "Objetivo eliminado",
        description: "El objetivo ha sido eliminado exitosamente"
      });
    } catch (error) {
      console.error("Error al eliminar objetivo:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el objetivo",
        variant: "destructive"
      });
    }
  };

  const handleViewIndicadores = (objetivo) => {
    setCurrentObjetivo(objetivo);
    setShowIndicadores(true);
  };

  const handleBackFromIndicadores = () => {
    setShowIndicadores(false);
    setCurrentObjetivo(null);
  };

  const filteredObjetivos = objetivos.filter(objetivo =>
    objetivo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (objetivo.descripcion && objetivo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (objetivo.responsable && objetivo.responsable.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (showIndicadores && currentObjetivo) {
    return (
      <IndicadoresListing
        objetivoId={currentObjetivo.id}
        objetivoTitulo={currentObjetivo.titulo}
        procesoId={procesoId}
        procesoNombre={procesoNombre}
        onBack={handleBackFromIndicadores}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb y título */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Procesos
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{procesoNombre}</h2>
          <p className="text-muted-foreground">
            Objetivos del proceso
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar objetivos..."
              className="pl-8 h-10 w-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => {
            setSelectedObjetivo(null);
            setIsModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Objetivo
          </Button>
        </div>
      </div>

      {/* Lista de Objetivos */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando objetivos...</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-left p-4">Título</th>
                  <th className="text-left p-4">Descripción</th>
                  <th className="text-left p-4">Responsable</th>
                  <th className="text-left p-4">Meta</th>
                  <th className="text-left p-4">Estado</th>
                  <th className="text-right p-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredObjetivos.map((objetivo) => (
                  <motion.tr
                    key={objetivo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleViewIndicadores(objetivo)}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-primary" />
                        <div className="flex items-center">
                          <span className="font-medium">{objetivo.titulo}</span>
                          <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm line-clamp-2">{objetivo.descripcion}</p>
                    </td>
                    <td className="p-4">{objetivo.responsable}</td>
                    <td className="p-4">
                      <p className="text-sm">{objetivo.meta}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        objetivo.estado === "Completado" 
                          ? "bg-green-100 text-green-800"
                          : objetivo.estado === "En progreso"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {objetivo.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(objetivo);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(objetivo.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewIndicadores(objetivo);
                        }}
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredObjetivos.length === 0 && (
              <div className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No hay objetivos registrados para este proceso. Haz clic en "Nuevo Objetivo" para comenzar.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <ObjetivoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedObjetivo(null);
        }}
        onSave={handleSave}
        objetivo={selectedObjetivo}
        procesoId={procesoId}
        procesoNombre={procesoNombre}
      />
    </div>
  );
}

export default ObjetivosListing;
