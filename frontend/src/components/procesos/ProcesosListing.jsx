import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Search, 
  Download, 
  Pencil, 
  Trash2, 
  FileText,
  LayoutGrid,
  List,
  ChevronRight,
  Target,
  ArrowLeft
} from "lucide-react";
import ProcesoModal from "./ProcesoModal";
import ObjetivosListing from "./ObjetivosListing";
import ProcesoSingle from "./ProcesoSingle";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { createClient } from '@libsql/client';

const ProcesoCard = React.memo(({ proceso, onView, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
    onClick={() => onView(proceso)}
  >
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="flex items-center">
          <h3 className="font-semibold truncate">{proceso.nombre}</h3>
          <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{proceso.descripcion}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{proceso.tipo}</span>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(proceso);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(proceso.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </motion.div>
));

function ProcesosListing() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProceso, setSelectedProceso] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [procesoToDelete, setProcesoToDelete] = useState(null);
  const [procesos, setProcesos] = useState([]);
  const [showObjetivos, setShowObjetivos] = useState(false);
  const [showProcesoSingle, setShowProcesoSingle] = useState(false);
  const [currentProceso, setCurrentProceso] = useState(null);

  // Cliente Turso
  const client = createClient({
    url: import.meta.env.VITE_TURSO_DATABASE_URL,
    authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN
  });
  
  // Log para depuración
  console.log('URL de la base de datos:', import.meta.env.VITE_TURSO_DATABASE_URL);

  useEffect(() => {
    loadProcesos();
  }, []);

  const loadProcesos = async () => {
    try {
      setIsLoading(true);
      
      // Intentar cargar desde Turso primero
      try {
        const result = await client.execute({
          sql: 'SELECT * FROM procesos'
        });
        
        if (result.rows.length > 0) {
          setProcesos(result.rows);
          setIsLoading(false);
          return;
        }
      } catch (dbError) {
        console.log("Fallback a localStorage:", dbError);
      }
      
      // Intentar cargar desde localStorage
      const saved = localStorage.getItem("procesos");
      let data = saved ? JSON.parse(saved) : [];
      
      // Si no hay datos, crear datos de muestra
      if (data.length === 0) {
        data = [
          {
            id: 1,
            nombre: "Proceso de Producción",
            descripcion: "Proceso principal de fabricación de productos",
            tipo: "Operativo",
            responsable: "Juan Pérez",
            fecha_actualizacion: "2023-05-15",
            documentos_relacionados: "PRO-001, PRO-002",
            indicadores_clave: "Tiempo de producción, Tasa de defectos"
          },
          {
            id: 2,
            nombre: "Gestión de Compras",
            descripcion: "Proceso para la adquisición de materiales y servicios",
            tipo: "Apoyo",
            responsable: "María López",
            fecha_actualizacion: "2023-06-10",
            documentos_relacionados: "COM-001, COM-002",
            indicadores_clave: "Tiempo de entrega, Calidad de proveedores"
          },
          {
            id: 3,
            nombre: "Gestión Documental",
            descripcion: "Proceso para el control y gestión de la documentación del SGC",
            tipo: "Estratégico",
            responsable: "Carlos Rodríguez",
            fecha_actualizacion: "2023-04-20",
            documentos_relacionados: "DOC-001",
            indicadores_clave: "Documentos actualizados, Tiempo de aprobación"
          }
        ];
        
        // Guardar datos de muestra en localStorage
        localStorage.setItem("procesos", JSON.stringify(data));
        
        // Intentar guardar los datos de muestra en Turso
        try {
          for (const proceso of data) {
            await saveProcesoToTurso(proceso);
          }
        } catch (error) {
          console.error("Error saving sample data to Turso:", error);
        }
      }
      
      setProcesos(data);
    } catch (error) {
      console.error("Error loading procesos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los procesos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProcesoToTurso = async (proceso) => {
    try {
      // Verificar si el proceso ya existe
      const checkResult = await client.execute({
        sql: 'SELECT id FROM procesos WHERE id = ?',
        args: [proceso.id]
      });

      if (checkResult.rows.length > 0) {
        // Actualizar
        await client.execute({
          sql: `UPDATE procesos SET 
                nombre = ?, 
                descripcion = ?, 
                tipo = ?, 
                responsable = ?, 
                fecha_actualizacion = ?, 
                documentos_relacionados = ?, 
                indicadores_clave = ? 
                WHERE id = ?`,
          args: [
            proceso.nombre,
            proceso.descripcion,
            proceso.tipo,
            proceso.responsable,
            proceso.fecha_actualizacion,
            proceso.documentos_relacionados,
            proceso.indicadores_clave,
            proceso.id
          ]
        });
      } else {
        // Insertar
        await client.execute({
          sql: `INSERT INTO procesos (
                id, 
                nombre, 
                descripcion, 
                tipo, 
                responsable, 
                fecha_actualizacion, 
                documentos_relacionados, 
                indicadores_clave
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            proceso.id,
            proceso.nombre,
            proceso.descripcion,
            proceso.tipo,
            proceso.responsable,
            proceso.fecha_actualizacion,
            proceso.documentos_relacionados,
            proceso.indicadores_clave
          ]
        });
      }
      return true;
    } catch (error) {
      console.error("Error saving to Turso:", error);
      return false;
    }
  };

  const handleSave = async (procesoData) => {
    try {
      setIsLoading(true);
      let updatedProcesos;
      let savedProceso;
      
      // Obtener todos los procesos para actualizar localStorage
      const saved = localStorage.getItem("procesos");
      const allProcesos = saved ? JSON.parse(saved) : [];
      
      if (selectedProceso) {
        savedProceso = { ...procesoData, id: selectedProceso.id };
        
        // Actualizar el estado local
        updatedProcesos = procesos.map(p => 
          p.id === selectedProceso.id ? savedProceso : p
        );
        
        // Actualizar localStorage
        const updatedAllProcesos = allProcesos.map(p => 
          p.id === selectedProceso.id ? savedProceso : p
        );
        
        toast({
          title: "Proceso actualizado",
          description: "Los datos del proceso han sido actualizados exitosamente"
        });
        
        // Guardar en Turso
        const tursoSaved = await saveProcesoToTurso(savedProceso);
        if (!tursoSaved) {
          // Fallback a localStorage si falla Turso
          localStorage.setItem("procesos", JSON.stringify(updatedAllProcesos));
        }
      } else {
        savedProceso = { ...procesoData, id: Date.now() };
        
        // Actualizar el estado local
        updatedProcesos = [...procesos, savedProceso];
        
        // Actualizar localStorage
        const updatedAllProcesos = [...allProcesos, savedProceso];
        
        toast({
          title: "Proceso creado",
          description: "Se ha agregado un nuevo proceso exitosamente"
        });
        
        // Guardar en Turso
        const tursoSaved = await saveProcesoToTurso(savedProceso);
        if (!tursoSaved) {
          // Fallback a localStorage si falla Turso
          localStorage.setItem("procesos", JSON.stringify(updatedAllProcesos));
        }
      }
      
      setProcesos(updatedProcesos);
      setIsModalOpen(false);
      setSelectedProceso(null);
    } catch (error) {
      console.error("Error saving proceso:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el proceso",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (proceso) => {
    setSelectedProceso(proceso);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const proceso = procesos.find(p => p.id === id);
    setProcesoToDelete(proceso);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!procesoToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Intentar eliminar de Turso primero
      try {
        await client.execute({
          sql: 'DELETE FROM procesos WHERE id = ?',
          args: [procesoToDelete.id]
        });
      } catch (dbError) {
        console.log("Fallback a localStorage para eliminar:", dbError);
      }
      
      // Actualizar estado local
      const updatedProcesos = procesos.filter(p => p.id !== procesoToDelete.id);
      setProcesos(updatedProcesos);
      
      // Actualizar localStorage
      const saved = localStorage.getItem("procesos");
      const allProcesos = saved ? JSON.parse(saved) : [];
      const updatedAllProcesos = allProcesos.filter(p => p.id !== procesoToDelete.id);
      localStorage.setItem("procesos", JSON.stringify(updatedAllProcesos));
      
      toast({
        title: "Proceso eliminado",
        description: "El proceso ha sido eliminado exitosamente"
      });
      
      setDeleteDialogOpen(false);
      setProcesoToDelete(null);
    } catch (error) {
      console.error("Error deleting proceso:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el proceso",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProceso = (proceso) => {
    setCurrentProceso(proceso);
    setShowProcesoSingle(true);
  };
  
  const handleViewObjetivos = (proceso) => {
    setCurrentProceso(proceso);
    setShowObjetivos(true);
  };

  const handleBackFromObjetivos = () => {
    setShowObjetivos(false);
    setCurrentProceso(null);
  };
  
  const handleBackFromProceso = () => {
    setShowProcesoSingle(false);
    setCurrentProceso(null);
  };

  // Si estamos viendo los objetivos de un proceso
  if (showObjetivos && currentProceso) {
    return (
      <ObjetivosListing 
        proceso={currentProceso} 
        onBack={handleBackFromObjetivos}
      />
    );
  } else if (showProcesoSingle && currentProceso) {
    return (
      <ProcesoSingle 
        proceso={currentProceso} 
        onBack={handleBackFromProceso}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  // Filtrar procesos según búsqueda
  const filteredProcesos = procesos.filter(proceso =>
    proceso.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proceso.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proceso.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proceso.responsable?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Procesos</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <motion.div layout className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar procesos..."
                className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button onClick={() => {
                setSelectedProceso(null);
                setIsModalOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proceso
              </Button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProcesos.map((proceso) => (
                <ProcesoCard
                  key={proceso.id}
                  proceso={proceso}
                  onView={handleViewProceso}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
              {filteredProcesos.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    No hay procesos registrados. Haz clic en "Nuevo Proceso" para comenzar.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="text-left p-4">Proceso</th>
                    <th className="text-left p-4">Descripción</th>
                    <th className="text-left p-4">Tipo</th>
                    <th className="text-left p-4">Responsable</th>
                    <th className="text-right p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcesos.map((proceso) => (
                    <motion.tr
                      key={proceso.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border cursor-pointer hover:bg-accent/50"
                      onClick={() => handleViewProceso(proceso)}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex items-center">
                            <span className="font-medium">{proceso.nombre}</span>
                            <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm line-clamp-2">{proceso.descripcion}</p>
                      </td>
                      <td className="p-4">{proceso.tipo}</td>
                      <td className="p-4">{proceso.responsable}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(proceso);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(proceso.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProceso(proceso);
                          }}
                        >
                          <Target className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filteredProcesos.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    No hay procesos registrados. Haz clic en "Nuevo Proceso" para comenzar.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <ProcesoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProceso(null);
        }}
        onSave={handleSave}
        proceso={selectedProceso}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proceso {procesoToDelete?.nombre}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProcesosListing;
