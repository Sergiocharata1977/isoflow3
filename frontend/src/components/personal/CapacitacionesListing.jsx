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
  GraduationCap
} from "lucide-react";
import CapacitacionModal from "./CapacitacionModal";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { createClient } from '@libsql/client';

function CapacitacionesListing({ personId }) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCapacitacion, setSelectedCapacitacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [capacitacionToDelete, setCapacitacionToDelete] = useState(null);

  // Cliente Turso
  const client = createClient({
    url: "libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ"
  });

  useEffect(() => {
    loadCapacitaciones();
  }, [personId]);

  const loadCapacitaciones = async () => {
    try {
      setIsLoading(true);
      
      // Intentar cargar desde Turso primero
      try {
        const query = personId 
          ? 'SELECT * FROM capacitaciones WHERE persona_id = ?' 
          : 'SELECT * FROM capacitaciones';
        
        const args = personId ? [personId] : [];
        
        const result = await client.execute({
          sql: query,
          args: args
        });
        
        if (result.rows.length > 0) {
          setCapacitaciones(result.rows);
          setIsLoading(false);
          return;
        }
      } catch (dbError) {
        console.log("Fallback a localStorage:", dbError);
      }
      
      // Fallback a localStorage
      const saved = localStorage.getItem("capacitaciones");
      let data = saved ? JSON.parse(saved) : [];
      
      // Filtrar por persona_id si es necesario
      if (personId) {
        data = data.filter(c => c.persona_id === personId);
      }
      
      // Si no hay datos, crear datos de muestra
      if (data.length === 0 && !personId) {
        data = [
          {
            id: 1,
            titulo: "ISO 9001:2015 - Fundamentos",
            instructor: "Ana Martínez",
            fecha: "2023-06-15",
            duracion: "16 horas",
            descripcion: "Fundamentos y principios de la norma ISO 9001:2015 para sistemas de gestión de calidad.",
            persona_id: null,
            estado: "Completado",
            calificacion: 95
          },
          {
            id: 2,
            titulo: "Auditor Interno ISO 9001",
            instructor: "Roberto Sánchez",
            fecha: "2023-07-20",
            duracion: "24 horas",
            descripcion: "Formación para realizar auditorías internas según la norma ISO 9001:2015.",
            persona_id: null,
            estado: "Completado",
            calificacion: 90
          },
          {
            id: 3,
            titulo: "Gestión de Riesgos",
            instructor: "Carlos Gómez",
            fecha: "2023-08-10",
            duracion: "8 horas",
            descripcion: "Metodologías para la identificación, análisis y evaluación de riesgos en sistemas de gestión.",
            persona_id: null,
            estado: "Programado",
            calificacion: null
          }
        ];
        
        // Guardar datos de muestra en localStorage
        localStorage.setItem("capacitaciones", JSON.stringify(data));
        
        // Intentar guardar los datos de muestra en Turso
        try {
          for (const capacitacion of data) {
            await saveCapacitacionToTurso(capacitacion);
          }
        } catch (error) {
          console.error("Error saving sample data to Turso:", error);
        }
      }
      
      setCapacitaciones(data);
    } catch (error) {
      console.error("Error loading capacitaciones:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las capacitaciones",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCapacitacionToTurso = async (capacitacion) => {
    try {
      // Verificar si la capacitación ya existe
      const checkResult = await client.execute({
        sql: 'SELECT id FROM capacitaciones WHERE id = ?',
        args: [capacitacion.id]
      });

      if (checkResult.rows.length > 0) {
        // Actualizar
        await client.execute({
          sql: `UPDATE capacitaciones SET 
                titulo = ?, 
                instructor = ?, 
                fecha = ?, 
                duracion = ?, 
                descripcion = ?, 
                persona_id = ?,
                estado = ?,
                calificacion = ?
                WHERE id = ?`,
          args: [
            capacitacion.titulo,
            capacitacion.instructor,
            capacitacion.fecha,
            capacitacion.duracion,
            capacitacion.descripcion,
            capacitacion.persona_id,
            capacitacion.estado,
            capacitacion.calificacion,
            capacitacion.id
          ]
        });
      } else {
        // Insertar
        await client.execute({
          sql: `INSERT INTO capacitaciones (
                id, 
                titulo, 
                instructor, 
                fecha, 
                duracion, 
                descripcion,
                persona_id,
                estado,
                calificacion
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            capacitacion.id,
            capacitacion.titulo,
            capacitacion.instructor,
            capacitacion.fecha,
            capacitacion.duracion,
            capacitacion.descripcion,
            capacitacion.persona_id,
            capacitacion.estado,
            capacitacion.calificacion
          ]
        });
      }
      return true;
    } catch (error) {
      console.error("Error saving to Turso:", error);
      return false;
    }
  };

  const handleSave = async (capacitacionData) => {
    try {
      setIsLoading(true);
      let updatedCapacitaciones;
      let savedCapacitacion;
      
      // Obtener todos los registros para actualizar localStorage
      const saved = localStorage.getItem("capacitaciones");
      const allCapacitaciones = saved ? JSON.parse(saved) : [];
      
      // Si es una edición
      if (selectedCapacitacion) {
        savedCapacitacion = { 
          ...capacitacionData, 
          id: selectedCapacitacion.id,
          persona_id: personId || selectedCapacitacion.persona_id
        };
        
        // Actualizar el estado local
        updatedCapacitaciones = capacitaciones.map(c => 
          c.id === selectedCapacitacion.id ? savedCapacitacion : c
        );
        
        // Actualizar localStorage
        const updatedAllCapacitaciones = allCapacitaciones.map(c => 
          c.id === selectedCapacitacion.id ? savedCapacitacion : c
        );
        
        toast({
          title: "Capacitación actualizada",
          description: "Los datos de la capacitación han sido actualizados exitosamente"
        });
        
        // Guardar en Turso
        const tursoSaved = await saveCapacitacionToTurso(savedCapacitacion);
        if (!tursoSaved) {
          // Fallback a localStorage si falla Turso
          localStorage.setItem("capacitaciones", JSON.stringify(updatedAllCapacitaciones));
        }
      } else {
        // Si es una nueva capacitación
        savedCapacitacion = { 
          ...capacitacionData, 
          id: Date.now(),
          persona_id: personId || null
        };
        
        // Actualizar el estado local
        updatedCapacitaciones = [...capacitaciones, savedCapacitacion];
        
        // Actualizar localStorage
        const updatedAllCapacitaciones = [...allCapacitaciones, savedCapacitacion];
        
        toast({
          title: "Capacitación creada",
          description: "Se ha agregado una nueva capacitación exitosamente"
        });
        
        // Guardar en Turso
        const tursoSaved = await saveCapacitacionToTurso(savedCapacitacion);
        if (!tursoSaved) {
          // Fallback a localStorage si falla Turso
          localStorage.setItem("capacitaciones", JSON.stringify(updatedAllCapacitaciones));
        }
      }
      
      setCapacitaciones(updatedCapacitaciones);
      setIsModalOpen(false);
      setSelectedCapacitacion(null);
    } catch (error) {
      console.error("Error saving capacitacion:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la capacitación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (capacitacion) => {
    setSelectedCapacitacion(capacitacion);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const capacitacion = capacitaciones.find(c => c.id === id);
    setCapacitacionToDelete(capacitacion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!capacitacionToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Intentar eliminar de Turso primero
      try {
        await client.execute({
          sql: 'DELETE FROM capacitaciones WHERE id = ?',
          args: [capacitacionToDelete.id]
        });
      } catch (dbError) {
        console.log("Fallback a localStorage para eliminar:", dbError);
      }
      
      // Actualizar estado local
      const updatedCapacitaciones = capacitaciones.filter(c => c.id !== capacitacionToDelete.id);
      setCapacitaciones(updatedCapacitaciones);
      
      // Actualizar localStorage
      const saved = localStorage.getItem("capacitaciones");
      const allCapacitaciones = saved ? JSON.parse(saved) : [];
      const updatedAllCapacitaciones = allCapacitaciones.filter(c => c.id !== capacitacionToDelete.id);
      localStorage.setItem("capacitaciones", JSON.stringify(updatedAllCapacitaciones));
      
      toast({
        title: "Capacitación eliminada",
        description: "La capacitación ha sido eliminada exitosamente"
      });
      
      setDeleteDialogOpen(false);
      setCapacitacionToDelete(null);
    } catch (error) {
      console.error("Error deleting capacitacion:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la capacitación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCapacitaciones = capacitaciones.filter(capacitacion =>
    capacitacion.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    capacitacion.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    capacitacion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Capacitaciones</h2>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar capacitaciones..."
            className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => {
            setSelectedCapacitacion(null);
            setIsModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Capacitación
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCapacitaciones.map((capacitacion) => (
            <motion.div
              key={capacitacion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{capacitacion.titulo}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Instructor: {capacitacion.instructor}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <p className="text-sm">
                        Fecha: {capacitacion.fecha}
                      </p>
                      <p className="text-sm">
                        Duración: {capacitacion.duracion}
                      </p>
                      {capacitacion.estado && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          capacitacion.estado === "Completado" ? "bg-green-100 text-green-800" :
                          capacitacion.estado === "En progreso" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {capacitacion.estado}
                        </span>
                      )}
                      {capacitacion.calificacion && (
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          Calificación: {capacitacion.calificacion}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-2">{capacitacion.descripcion}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(capacitacion)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(capacitacion.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredCapacitaciones.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No hay capacitaciones registradas. Haz clic en "Nueva Capacitación" para comenzar.
              </p>
            </div>
          )}
        </div>
      )}

      <CapacitacionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCapacitacion(null);
        }}
        onSave={handleSave}
        capacitacion={selectedCapacitacion}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la capacitación "{capacitacionToDelete?.titulo}".
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

export default CapacitacionesListing;
