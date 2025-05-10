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
  Award
} from "lucide-react";
import EvaluacionModal from "./EvaluacionModal";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { createClient } from '@libsql/client';

function EvaluacionesListing({ personId }) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluacionToDelete, setEvaluacionToDelete] = useState(null);

  // Cliente Turso
  const client = createClient({
    url: "libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ"
  });

  useEffect(() => {
    loadEvaluaciones();
  }, [personId]);

  const loadEvaluaciones = async () => {
    try {
      setIsLoading(true);
      
      // Intentar cargar desde Turso primero
      try {
        const query = personId 
          ? 'SELECT * FROM evaluaciones WHERE persona_id = ?' 
          : 'SELECT * FROM evaluaciones';
        
        const args = personId ? [personId] : [];
        
        const result = await client.execute({
          sql: query,
          args: args
        });
        
        if (result.rows.length > 0) {
          setEvaluaciones(result.rows);
          setIsLoading(false);
          return;
        }
      } catch (dbError) {
        console.log("Fallback a localStorage:", dbError);
      }
      
      // Fallback a localStorage
      const saved = localStorage.getItem("evaluaciones");
      let data = saved ? JSON.parse(saved) : [];
      
      // Filtrar por persona_id si es necesario
      if (personId) {
        data = data.filter(e => e.persona_id === personId);
      }
      
      // Si no hay datos, crear datos de muestra
      if (data.length === 0 && !personId) {
        data = [
          {
            id: 1,
            empleado: "Juan Pérez",
            evaluador: "Ana Martínez",
            fecha: "2023-06-30",
            periodo: "Primer semestre 2023",
            resultado: 92,
            comentarios: "Excelente desempeño en todas las áreas evaluadas. Destaca en liderazgo y trabajo en equipo.",
            persona_id: 1,
            competencias: {
              liderazgo: 90,
              trabajo_equipo: 95,
              comunicacion: 88,
              conocimiento_tecnico: 94
            }
          },
          {
            id: 2,
            empleado: "María López",
            evaluador: "Carlos Rodríguez",
            fecha: "2023-06-25",
            periodo: "Primer semestre 2023",
            resultado: 85,
            comentarios: "Buen desempeño general. Áreas de mejora: comunicación con el equipo.",
            persona_id: 2,
            competencias: {
              liderazgo: 80,
              trabajo_equipo: 75,
              comunicacion: 70,
              conocimiento_tecnico: 90
            }
          },
          {
            id: 3,
            empleado: "Carlos Rodríguez",
            evaluador: "Roberto Sánchez",
            fecha: "2023-06-28",
            periodo: "Primer semestre 2023",
            resultado: 78,
            comentarios: "Desempeño satisfactorio. Necesita mejorar en gestión del tiempo y priorización de tareas.",
            persona_id: 3,
            competencias: {
              liderazgo: 75,
              trabajo_equipo: 80,
              comunicacion: 85,
              conocimiento_tecnico: 78
            }
          }
        ];
        
        // Guardar datos de muestra en localStorage
        localStorage.setItem("evaluaciones", JSON.stringify(data));
        
        // Intentar guardar los datos de muestra en Turso
        try {
          for (const evaluacion of data) {
            await saveEvaluacionToTurso(evaluacion);
          }
        } catch (error) {
          console.error("Error saving sample data to Turso:", error);
        }
      }
      
      setEvaluaciones(data);
    } catch (error) {
      console.error("Error loading evaluaciones:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las evaluaciones",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveEvaluacionToTurso = async (evaluacion) => {
    try {
      // Convertir el objeto competencias a JSON string para almacenamiento
      const competenciasStr = evaluacion.competencias ? JSON.stringify(evaluacion.competencias) : null;
      
      // Verificar si la evaluación ya existe
      const checkResult = await client.execute({
        sql: 'SELECT id FROM evaluaciones WHERE id = ?',
        args: [evaluacion.id]
      });

      if (checkResult.rows.length > 0) {
        // Actualizar
        await client.execute({
          sql: `UPDATE evaluaciones SET 
                empleado = ?, 
                evaluador = ?, 
                fecha = ?, 
                periodo = ?, 
                resultado = ?, 
                comentarios = ?,
                persona_id = ?,
                competencias = ?
                WHERE id = ?`,
          args: [
            evaluacion.empleado,
            evaluacion.evaluador,
            evaluacion.fecha,
            evaluacion.periodo,
            evaluacion.resultado,
            evaluacion.comentarios,
            evaluacion.persona_id,
            competenciasStr,
            evaluacion.id
          ]
        });
      } else {
        // Insertar
        await client.execute({
          sql: `INSERT INTO evaluaciones (
                id, 
                empleado, 
                evaluador, 
                fecha, 
                periodo, 
                resultado,
                comentarios,
                persona_id,
                competencias
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            evaluacion.id,
            evaluacion.empleado,
            evaluacion.evaluador,
            evaluacion.fecha,
            evaluacion.periodo,
            evaluacion.resultado,
            evaluacion.comentarios,
            evaluacion.persona_id,
            competenciasStr
          ]
        });
      }
      return true;
    } catch (error) {
      console.error("Error saving to Turso:", error);
      return false;
    }
  };

  const handleSave = async (evaluacionData) => {
    try {
      setIsLoading(true);
      let updatedEvaluaciones;
      let savedEvaluacion;
      
      // Obtener todos los registros para actualizar localStorage
      const saved = localStorage.getItem("evaluaciones");
      const allEvaluaciones = saved ? JSON.parse(saved) : [];
      
      // Si es una edición
      if (selectedEvaluacion) {
        savedEvaluacion = { 
          ...evaluacionData, 
          id: selectedEvaluacion.id,
          persona_id: personId || selectedEvaluacion.persona_id
        };
        
        // Actualizar el estado local
        updatedEvaluaciones = evaluaciones.map(e => 
          e.id === selectedEvaluacion.id ? savedEvaluacion : e
        );
        
        // Actualizar localStorage
        const updatedAllEvaluaciones = allEvaluaciones.map(e => 
          e.id === selectedEvaluacion.id ? savedEvaluacion : e
        );
        
        toast({
          title: "Evaluación actualizada",
          description: "Los datos de la evaluación han sido actualizados exitosamente"
        });
        
        // Guardar en Turso
        const tursoSaved = await saveEvaluacionToTurso(savedEvaluacion);
        if (!tursoSaved) {
          // Fallback a localStorage si falla Turso
          localStorage.setItem("evaluaciones", JSON.stringify(updatedAllEvaluaciones));
        }
      } else {
        // Si es una nueva evaluación
        savedEvaluacion = { 
          ...evaluacionData, 
          id: Date.now(),
          persona_id: personId || null
        };
        
        // Actualizar el estado local
        updatedEvaluaciones = [...evaluaciones, savedEvaluacion];
        
        // Actualizar localStorage
        const updatedAllEvaluaciones = [...allEvaluaciones, savedEvaluacion];
        
        toast({
          title: "Evaluación creada",
          description: "Se ha agregado una nueva evaluación exitosamente"
        });
        
        // Guardar en Turso
        const tursoSaved = await saveEvaluacionToTurso(savedEvaluacion);
        if (!tursoSaved) {
          // Fallback a localStorage si falla Turso
          localStorage.setItem("evaluaciones", JSON.stringify(updatedAllEvaluaciones));
        }
      }
      
      setEvaluaciones(updatedEvaluaciones);
      setIsModalOpen(false);
      setSelectedEvaluacion(null);
    } catch (error) {
      console.error("Error saving evaluacion:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la evaluación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const evaluacion = evaluaciones.find(e => e.id === id);
    setEvaluacionToDelete(evaluacion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!evaluacionToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Intentar eliminar de Turso primero
      try {
        await client.execute({
          sql: 'DELETE FROM evaluaciones WHERE id = ?',
          args: [evaluacionToDelete.id]
        });
      } catch (dbError) {
        console.log("Fallback a localStorage para eliminar:", dbError);
      }
      
      // Actualizar estado local
      const updatedEvaluaciones = evaluaciones.filter(e => e.id !== evaluacionToDelete.id);
      setEvaluaciones(updatedEvaluaciones);
      
      // Actualizar localStorage
      const saved = localStorage.getItem("evaluaciones");
      const allEvaluaciones = saved ? JSON.parse(saved) : [];
      const updatedAllEvaluaciones = allEvaluaciones.filter(e => e.id !== evaluacionToDelete.id);
      localStorage.setItem("evaluaciones", JSON.stringify(updatedAllEvaluaciones));
      
      toast({
        title: "Evaluación eliminada",
        description: "La evaluación ha sido eliminada exitosamente"
      });
      
      setDeleteDialogOpen(false);
      setEvaluacionToDelete(null);
    } catch (error) {
      console.error("Error deleting evaluacion:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la evaluación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvaluaciones = evaluaciones.filter(evaluacion =>
    evaluacion.empleado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluacion.evaluador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluacion.periodo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Evaluaciones de Desempeño</h2>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar evaluaciones..."
            className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => {
            setSelectedEvaluacion(null);
            setIsModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Evaluación
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvaluaciones.map((evaluacion) => (
            <motion.div
              key={evaluacion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{evaluacion.empleado}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Evaluador: {evaluacion.evaluador}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <p className="text-sm">
                        Fecha: {evaluacion.fecha}
                      </p>
                      <p className="text-sm">
                        Periodo: {evaluacion.periodo}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        evaluacion.resultado >= 90 ? "bg-green-100 text-green-800" :
                        evaluacion.resultado >= 70 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        Resultado: {evaluacion.resultado}%
                      </span>
                    </div>
                    {evaluacion.comentarios && (
                      <p className="text-sm mt-2 text-muted-foreground">{evaluacion.comentarios}</p>
                    )}
                    {evaluacion.competencias && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {Object.entries(typeof evaluacion.competencias === 'string' ? 
                          JSON.parse(evaluacion.competencias) : 
                          evaluacion.competencias
                        ).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <div className="w-full max-w-[150px]">
                              <div className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}</div>
                              <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
                                <div 
                                  className={`h-2 rounded-full ${
                                    value >= 90 ? "bg-green-500" :
                                    value >= 70 ? "bg-yellow-500" :
                                    "bg-red-500"
                                  }`}
                                  style={{ width: `${value}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-xs">{value}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(evaluacion)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(evaluacion.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredEvaluaciones.length === 0 && (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No hay evaluaciones registradas. Haz clic en "Nueva Evaluación" para comenzar.
              </p>
            </div>
          )}
        </div>
      )}

      <EvaluacionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvaluacion(null);
        }}
        onSave={handleSave}
        evaluacion={selectedEvaluacion}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la evaluación de {evaluacionToDelete?.empleado}.
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

export default EvaluacionesListing;
