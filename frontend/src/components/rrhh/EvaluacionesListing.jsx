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
  ClipboardCheck,
  Users,
  LayoutGrid,
  List,
  ChevronRight,
  Calendar,
  Star,
  AlertCircle
} from "lucide-react";
import EvaluacionModal from "./EvaluacionModal";
import EvaluacionSingle from "./EvaluacionSingle";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { createClient } from '@libsql/client';

// Configuración del cliente Turso
const client = createClient({
  url: "libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ"
});

function EvaluacionesListing() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSingle, setShowSingle] = useState(false);
  const [currentEvaluacion, setCurrentEvaluacion] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluacionToDelete, setEvaluacionToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [evaluaciones, setEvaluaciones] = useState([]);

  // Datos de ejemplo para usar si no hay datos
  const evaluacionesMuestra = [
    {
      id: 1,
      codigo: "EVAL-2025-001",
      empleado: "Carlos Martínez",
      puesto: "Director General",
      departamento: "Dirección General",
      evaluador: "Consejo Directivo",
      periodo: "Enero - Diciembre 2024",
      fechaEvaluacion: "2025-01-15",
      estado: "completada",
      calificacionGeneral: 4.5,
      fortalezas: "Liderazgo estratégico\nToma de decisiones\nVisión de negocio\nComunicación efectiva",
      areasOportunidad: "Delegación de tareas\nBalance vida-trabajo",
      comentarios: "Excelente desempeño durante el periodo evaluado. Ha liderado con éxito la implementación del sistema de gestión de calidad y la expansión de la empresa.",
      planesAccion: "Participar en un programa de coaching ejecutivo\nImplementar estrategias de delegación efectiva",
      competencias: [
        { nombre: "Liderazgo", calificacion: 5, comentario: "Excelente capacidad para inspirar y guiar al equipo" },
        { nombre: "Toma de decisiones", calificacion: 4.5, comentario: "Decisiones acertadas basadas en análisis de datos" },
        { nombre: "Comunicación", calificacion: 4, comentario: "Buena comunicación, puede mejorar en situaciones de crisis" },
        { nombre: "Gestión de recursos", calificacion: 4.5, comentario: "Optimización efectiva de recursos disponibles" },
        { nombre: "Innovación", calificacion: 4, comentario: "Promueve la innovación en la organización" }
      ],
      objetivos: [
        { descripcion: "Implementar el SGC ISO 9001", cumplimiento: 100, comentario: "Certificación obtenida en el tiempo previsto" },
        { descripcion: "Reducir costos operativos en 10%", cumplimiento: 85, comentario: "Se logró una reducción del 8.5%" },
        { descripcion: "Expandir operaciones a nuevos mercados", cumplimiento: 100, comentario: "Se abrieron 2 nuevas sucursales" }
      ]
    },
    {
      id: 2,
      codigo: "EVAL-2025-002",
      empleado: "Ana López",
      puesto: "Gerente de Calidad",
      departamento: "Calidad",
      evaluador: "Carlos Martínez",
      periodo: "Enero - Diciembre 2024",
      fechaEvaluacion: "2025-01-20",
      estado: "completada",
      calificacionGeneral: 4.8,
      fortalezas: "Conocimiento técnico\nGestión de auditorías\nImplementación de mejoras\nCapacidad analítica",
      areasOportunidad: "Desarrollo de habilidades de liderazgo\nDelegación de tareas",
      comentarios: "Desempeño sobresaliente en la gestión del sistema de calidad. Ha logrado mantener la certificación y mejorar los indicadores clave.",
      planesAccion: "Participar en el programa de desarrollo de líderes\nImplementar un sistema de gestión de tareas",
      competencias: [
        { nombre: "Conocimiento técnico", calificacion: 5, comentario: "Dominio completo de las normas y requisitos" },
        { nombre: "Gestión de proyectos", calificacion: 4.5, comentario: "Excelente planificación y seguimiento" },
        { nombre: "Comunicación", calificacion: 4.5, comentario: "Clara y efectiva en todos los niveles" },
        { nombre: "Trabajo en equipo", calificacion: 5, comentario: "Gran capacidad para colaborar y coordinar" },
        { nombre: "Resolución de problemas", calificacion: 5, comentario: "Enfoque analítico y soluciones efectivas" }
      ],
      objetivos: [
        { descripcion: "Mantener certificación ISO 9001", cumplimiento: 100, comentario: "Auditoría superada sin no conformidades" },
        { descripcion: "Reducir no conformidades en 20%", cumplimiento: 100, comentario: "Se logró una reducción del 25%" },
        { descripcion: "Implementar sistema de gestión documental", cumplimiento: 90, comentario: "En fase final de implementación" }
      ]
    },
    {
      id: 3,
      codigo: "EVAL-2025-003",
      empleado: "Jorge Gutiérrez",
      puesto: "Gerente de Producción",
      departamento: "Producción",
      evaluador: "Carlos Martínez",
      periodo: "Enero - Diciembre 2024",
      fechaEvaluacion: "2025-01-25",
      estado: "completada",
      calificacionGeneral: 4.2,
      fortalezas: "Conocimiento técnico\nGestión de equipos\nOptimización de procesos\nResolución de problemas",
      areasOportunidad: "Comunicación interdepartamental\nGestión del estrés",
      comentarios: "Buen desempeño general. Ha logrado mantener la producción según lo planificado y ha implementado mejoras en los procesos.",
      planesAccion: "Participar en talleres de comunicación efectiva\nImplementar reuniones interdepartamentales periódicas",
      competencias: [
        { nombre: "Conocimiento técnico", calificacion: 4.5, comentario: "Excelente dominio de procesos y equipos" },
        { nombre: "Gestión de equipos", calificacion: 4, comentario: "Buen liderazgo, puede mejorar la motivación" },
        { nombre: "Planificación", calificacion: 4.5, comentario: "Cumplimiento consistente de plazos" },
        { nombre: "Resolución de problemas", calificacion: 4.5, comentario: "Rápida respuesta ante contingencias" },
        { nombre: "Comunicación", calificacion: 3.5, comentario: "Área de oportunidad, especialmente con otros departamentos" }
      ],
      objetivos: [
        { descripcion: "Aumentar productividad en 15%", cumplimiento: 90, comentario: "Se logró un aumento del 13.5%" },
        { descripcion: "Reducir desperdicios en 10%", cumplimiento: 100, comentario: "Se logró una reducción del 12%" },
        { descripcion: "Implementar sistema de mantenimiento preventivo", cumplimiento: 80, comentario: "En proceso, avance significativo" }
      ]
    }
  ];

  // Cargar datos desde Turso con fallback a localStorage
  useEffect(() => {
    const fetchEvaluaciones = async () => {
      setIsLoading(true);
      try {
        // Intentar obtener datos de Turso
        const result = await client.execute({
          sql: "SELECT * FROM evaluaciones_rrhh ORDER BY id DESC"
        });
        
        if (result.rows.length > 0) {
          // Transformar los datos de la base de datos
          const evaluacionesData = result.rows.map(row => {
            // Convertir campos JSON de string a objeto
            const competencias = row.competencias ? JSON.parse(row.competencias) : [];
            const objetivos = row.objetivos ? JSON.parse(row.objetivos) : [];
            
            return {
              id: row.id,
              codigo: row.codigo || "",
              empleado: row.empleado || "",
              puesto: row.puesto || "",
              departamento: row.departamento || "",
              evaluador: row.evaluador || "",
              periodo: row.periodo || "",
              fechaEvaluacion: row.fecha || "",
              estado: row.estado || "",
              calificacionGeneral: row.calificacion_general || 0,
              fortalezas: row.fortalezas || "",
              areasOportunidad: row.areas_mejora || "",
              comentarios: row.comentarios || "",
              planesAccion: row.plan_accion || "",
              competencias: competencias,
              objetivos: objetivos
            };
          });
          
          setEvaluaciones(evaluacionesData);
          
          // Actualizar localStorage como respaldo
          localStorage.setItem("evaluaciones", JSON.stringify(evaluacionesData));
          
          toast({
            title: "Datos cargados",
            description: "Evaluaciones cargadas desde la base de datos",
          });
        } else {
          // Si no hay datos en Turso, verificar localStorage
          const savedData = localStorage.getItem("evaluaciones");
          if (savedData) {
            setEvaluaciones(JSON.parse(savedData));
            
            // Sincronizar con la base de datos
            const parsedData = JSON.parse(savedData);
            for (const item of parsedData) {
              await insertEvaluacionToDb(item);
            }
            
            toast({
              title: "Datos cargados",
              description: "Evaluaciones cargadas desde almacenamiento local y sincronizadas con la base de datos",
            });
          } else {
            // Si no hay datos en localStorage, usar datos de muestra
            setEvaluaciones(evaluacionesMuestra);
            localStorage.setItem("evaluaciones", JSON.stringify(evaluacionesMuestra));
            
            // Insertar datos de muestra en la base de datos
            for (const item of evaluacionesMuestra) {
              await insertEvaluacionToDb(item);
            }
            
            toast({
              title: "Datos de muestra cargados",
              description: "Se han cargado evaluaciones de ejemplo",
            });
          }
        }
      } catch (err) {
        console.error("Error al cargar evaluaciones desde Turso:", err);
        setError("Error al conectar con la base de datos. Usando datos locales.");
        
        // Fallback a localStorage
        const savedData = localStorage.getItem("evaluaciones");
        if (savedData) {
          setEvaluaciones(JSON.parse(savedData));
          toast({
            title: "Error de conexión",
            description: "Usando datos almacenados localmente",
            variant: "destructive"
          });
        } else {
          // Si no hay datos en localStorage, usar datos de muestra
          setEvaluaciones(evaluacionesMuestra);
          localStorage.setItem("evaluaciones", JSON.stringify(evaluacionesMuestra));
          toast({
            title: "Datos de muestra cargados",
            description: "Se han cargado evaluaciones de ejemplo",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvaluaciones();
  }, []);

  // Función auxiliar para insertar evaluación en la base de datos
  const insertEvaluacionToDb = async (evaluacion) => {
    try {
      // Convertir arrays/objetos a JSON para almacenar en la base de datos
      const competenciasJSON = JSON.stringify(evaluacion.competencias || []);
      const objetivosJSON = JSON.stringify(evaluacion.objetivos || []);
      
      await client.execute({
        sql: `INSERT OR REPLACE INTO evaluaciones_rrhh 
              (id, codigo, titulo, empleado, evaluador, puesto, departamento, 
               fecha, periodo, estado, calificacion_general, competencias, 
               objetivos, fortalezas, areas_mejora, plan_accion, comentarios) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          evaluacion.id,
          evaluacion.codigo || "",
          evaluacion.titulo || evaluacion.empleado || "",
          evaluacion.empleado || "",
          evaluacion.evaluador || "",
          evaluacion.puesto || "",
          evaluacion.departamento || "",
          evaluacion.fechaEvaluacion || "",
          evaluacion.periodo || "",
          evaluacion.estado || "",
          evaluacion.calificacionGeneral || 0,
          competenciasJSON,
          objetivosJSON,
          evaluacion.fortalezas || "",
          evaluacion.areasOportunidad || "",
          evaluacion.planesAccion || "",
          evaluacion.comentarios || ""
        ]
      });
      return true;
    } catch (err) {
      console.error("Error al insertar evaluación en la base de datos:", err);
      return false;
    }
  };

  const handleSave = async (evaluacionData) => {
    try {
      let updatedEvaluaciones;
      let actionType;
      let newEvaluacion;

      if (evaluacionData.id) {
        // Actualización
        actionType = "actualizada";
        updatedEvaluaciones = evaluaciones.map((item) =>
          item.id === evaluacionData.id ? evaluacionData : item
        );
        newEvaluacion = evaluacionData;
      } else {
        // Creación
        actionType = "creada";
        const newId = Math.max(0, ...evaluaciones.map((e) => e.id)) + 1;
        newEvaluacion = { ...evaluacionData, id: newId };
        updatedEvaluaciones = [...evaluaciones, newEvaluacion];
      }

      // Intentar guardar en la base de datos primero
      try {
        await insertEvaluacionToDb(newEvaluacion);
        
        // Si la operación en la base de datos es exitosa, actualizar el estado y localStorage
        setEvaluaciones(updatedEvaluaciones);
        localStorage.setItem("evaluaciones", JSON.stringify(updatedEvaluaciones));
        
        toast({
          title: "Éxito",
          description: `Evaluación ${actionType} correctamente`,
        });
        
        setIsModalOpen(false);
        setSelectedEvaluacion(null);
      } catch (dbError) {
        console.error("Error al guardar en la base de datos:", dbError);
        
        // Fallback a localStorage si falla la base de datos
        setEvaluaciones(updatedEvaluaciones);
        localStorage.setItem("evaluaciones", JSON.stringify(updatedEvaluaciones));
        
        toast({
          title: "Guardado con advertencia",
          description: `Evaluación ${actionType} en almacenamiento local. Error de conexión a la base de datos.`,
          variant: "destructive",
        });
        
        setIsModalOpen(false);
        setSelectedEvaluacion(null);
      }
    } catch (error) {
      console.error("Error al guardar evaluación:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la evaluación",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const evaluacion = evaluaciones.find((e) => e.id === id);
    setEvaluacionToDelete(evaluacion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const id = evaluacionToDelete.id;
      
      // Intentar eliminar de la base de datos primero
      try {
        await client.execute({
          sql: "DELETE FROM evaluaciones_rrhh WHERE id = ?",
          args: [id]
        });
        
        // Si la operación en la base de datos es exitosa, actualizar el estado y localStorage
        const updatedEvaluaciones = evaluaciones.filter((e) => e.id !== id);
        setEvaluaciones(updatedEvaluaciones);
        localStorage.setItem("evaluaciones", JSON.stringify(updatedEvaluaciones));
        
        toast({
          title: "Éxito",
          description: "Evaluación eliminada correctamente",
        });
      } catch (dbError) {
        console.error("Error al eliminar de la base de datos:", dbError);
        
        // Fallback a localStorage si falla la base de datos
        const updatedEvaluaciones = evaluaciones.filter((e) => e.id !== id);
        setEvaluaciones(updatedEvaluaciones);
        localStorage.setItem("evaluaciones", JSON.stringify(updatedEvaluaciones));
        
        toast({
          title: "Eliminado con advertencia",
          description: "Evaluación eliminada del almacenamiento local. Error de conexión a la base de datos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al eliminar evaluación:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la evaluación",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEvaluacionToDelete(null);
    }
  };

  const handleViewEvaluacion = (evaluacion) => {
    setCurrentEvaluacion(evaluacion);
    setShowSingle(true);
  };

  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en proceso':
        return 'bg-blue-100 text-blue-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCalificacion = (calificacion) => {
    if (!calificacion || calificacion === 0) return "N/A";
    
    const estrellas = [];
    const calificacionRedondeada = Math.round(calificacion * 2) / 2; // Redondear a 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= calificacionRedondeada) {
        estrellas.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === calificacionRedondeada) {
        estrellas.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else {
        estrellas.push(<Star key={i} className="h-4 w-4 text-muted-foreground" />);
      }
    }
    
    return (
      <div className="flex items-center">
        <div className="flex mr-1">{estrellas}</div>
        <span className="text-sm">({calificacion})</span>
      </div>
    );
  };

  const filteredEvaluaciones = evaluaciones.filter(evaluacion =>
    evaluacion.empleado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluacion.puesto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluacion.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluacion.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          Cargando evaluaciones...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          {error}
        </p>
      </div>
    );
  }

  if (showSingle) {
    return (
      <EvaluacionSingle
        evaluacion={currentEvaluacion}
        onBack={() => setShowSingle(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Evaluaciones de Desempeño</h1>
        <Button onClick={() => {
          setSelectedEvaluacion(null);
          setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Evaluación
        </Button>
      </div>
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="bg-background border border-input rounded-md p-1 flex items-center">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0 rounded-sm"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0 rounded-sm"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar evaluaciones..."
              className="pl-8 h-10 w-full sm:w-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvaluaciones.map((evaluacion) => (
              <motion.div
                key={evaluacion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleViewEvaluacion(evaluacion)}
              >
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{evaluacion.empleado}</h3>
                      <p className="text-xs text-muted-foreground">
                        {evaluacion.codigo}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Puesto:</span>
                      <span className="text-sm font-medium">{evaluacion.puesto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Departamento:</span>
                      <span className="text-sm font-medium">{evaluacion.departamento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Periodo:</span>
                      <span className="text-sm font-medium">{evaluacion.periodo}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {evaluacion.fechaEvaluacion}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getEstadoBadgeColor(evaluacion.estado)}`}>
                      {evaluacion.estado}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      {evaluacion.estado === 'completada' && renderCalificacion(evaluacion.calificacionGeneral)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center"
                    >
                      <span className="mr-1">Ver detalles</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 px-6 py-3 flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(evaluacion);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(evaluacion.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-left p-4">Empleado</th>
                  <th className="text-left p-4">Puesto</th>
                  <th className="text-left p-4">Departamento</th>
                  <th className="text-left p-4">Fecha</th>
                  <th className="text-left p-4">Estado</th>
                  <th className="text-left p-4">Calificación</th>
                  <th className="text-right p-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvaluaciones.map((evaluacion) => (
                  <motion.tr
                    key={evaluacion.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border cursor-pointer hover:bg-accent/50"
                    onClick={() => handleViewEvaluacion(evaluacion)}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <ClipboardCheck className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{evaluacion.empleado}</p>
                          <p className="text-sm text-muted-foreground">
                            {evaluacion.codigo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{evaluacion.puesto}</td>
                    <td className="p-4">{evaluacion.departamento}</td>
                    <td className="p-4">{evaluacion.fechaEvaluacion}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getEstadoBadgeColor(evaluacion.estado)}`}>
                        {evaluacion.estado}
                      </span>
                    </td>
                    <td className="p-4">
                      {evaluacion.estado === 'completada' ? renderCalificacion(evaluacion.calificacionGeneral) : "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(evaluacion);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(evaluacion.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredEvaluaciones.length === 0 && (
              <div className="text-center py-12">
                <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No hay evaluaciones registradas. Haz clic en "Nueva Evaluación" para comenzar.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Modals */}
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
