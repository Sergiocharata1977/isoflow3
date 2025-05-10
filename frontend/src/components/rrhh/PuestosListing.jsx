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
  Building2,
  Users,
  LayoutGrid,
  List,
  ChevronRight,
  Briefcase
} from "lucide-react";
import PuestoModal from "./PuestoModal";
import PuestoSingle from "./PuestoSingle";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

// Cliente de Turso
const client = createClient({
  url: "libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ"
});

function PuestosListing() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPuesto, setSelectedPuesto] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSingle, setShowSingle] = useState(false);
  const [currentPuesto, setCurrentPuesto] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [puestoToDelete, setPuestoToDelete] = useState(null);
  const [puestos, setPuestos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPuestos();
  }, []);

  const loadPuestos = async () => {
    try {
      setIsLoading(true);
      
      // Intentar cargar desde Turso
      try {
        const result = await client.execute({
          sql: "SELECT * FROM puestos"
        });
        
        if (result.rows.length > 0) {
          // Procesar los datos para convertir campos JSON almacenados como texto
          const processedData = result.rows.map(row => ({
            ...row,
            personal: row.personal ? JSON.parse(row.personal) : []
          }));
          
          setPuestos(processedData);
          setIsLoading(false);
          return;
        }
      } catch (dbError) {
        console.error("Error al cargar desde Turso:", dbError);
      }
      
      // Si no se pudo cargar desde Turso, intentar desde localStorage
      const saved = localStorage.getItem("puestos");
      let initialData = saved ? JSON.parse(saved) : [];
      
      // Si hay datos en localStorage, intentar sincronizarlos con Turso
      if (initialData.length > 0) {
        try {
          for (const puesto of initialData) {
            await client.execute({
              sql: `INSERT OR REPLACE INTO puestos 
                    (id, codigo, nombre, descripcion, departamento, supervisor, 
                     estado, requisitos, funciones, responsabilidades, 
                     competencias, formacion, experiencia, personal) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                puesto.id, 
                puesto.codigo || '', 
                puesto.nombre, 
                puesto.descripcion || '', 
                puesto.departamento || '', 
                puesto.supervisor || '', 
                puesto.estado || 'activo', 
                puesto.requisitos || '', 
                puesto.funciones || '', 
                puesto.responsabilidades || '', 
                puesto.competencias || '', 
                puesto.formacion || '', 
                puesto.experiencia || '', 
                JSON.stringify(puesto.personal || [])
              ]
            });
          }
          
          setPuestos(initialData);
        } catch (syncError) {
          console.error("Error al sincronizar con Turso:", syncError);
          setPuestos(initialData);
        }
      } else {
        // Si no hay datos, crear datos de ejemplo
        const puestosMuestra = [
          {
            id: 1,
            codigo: "P202501-001",
            nombre: "Gerente de Calidad",
            descripcion: "Responsable de implementar, mantener y mejorar el Sistema de Gestión de Calidad, asegurando el cumplimiento de los requisitos de la norma ISO 9001.",
            departamento: "Calidad",
            supervisor: "Director General",
            estado: "activo",
            requisitos: "Conocimiento profundo de la norma ISO 9001:2015 y experiencia en implementación de sistemas de gestión.",
            funciones: "Desarrollar y mantener el SGC\nGestionar auditorías internas y externas\nCoordinar acciones correctivas y preventivas\nAnalizar datos para la mejora continua\nCapacitar al personal en temas de calidad",
            responsabilidades: "Asegurar el cumplimiento de los requisitos de la norma ISO 9001\nMantener la certificación del SGC\nReportar el desempeño del SGC a la alta dirección\nPromover la mejora continua en toda la organización",
            competencias: "Liderazgo\nPensamiento analítico\nOrientación a resultados\nCapacidad de comunicación\nTrabajo en equipo",
            formacion: "Ingeniería o carrera afín con especialización en Gestión de Calidad",
            experiencia: "Mínimo 3 años en puestos similares, preferentemente en empresas certificadas ISO 9001",
            personal: [
              { nombre: "Ana López", departamento: "Calidad" }
            ]
          },
          {
            id: 2,
            codigo: "P202501-002",
            nombre: "Auditor Interno",
            descripcion: "Responsable de realizar auditorías internas para verificar el cumplimiento del Sistema de Gestión de Calidad y proponer mejoras.",
            departamento: "Calidad",
            supervisor: "Gerente de Calidad",
            estado: "activo",
            requisitos: "Certificación como Auditor Interno ISO 9001 y conocimiento de técnicas de auditoría.",
            funciones: "Planificar y ejecutar auditorías internas\nElaborar informes de auditoría\nVerificar la implementación de acciones correctivas\nCapacitar a nuevos auditores internos\nParticipar en la revisión de documentos del SGC",
            responsabilidades: "Asegurar la objetividad e imparcialidad de las auditorías\nIdentificar oportunidades de mejora\nVerificar la eficacia de las acciones correctivas\nMantener la confidencialidad de la información",
            competencias: "Objetividad\nAtención al detalle\nComunicación efectiva\nCapacidad de análisis\nÉtica profesional",
            formacion: "Carrera técnica o profesional con certificación como Auditor Interno ISO 9001",
            experiencia: "Mínimo 1 año en áreas de calidad o mejora continua",
            personal: [
              { nombre: "Roberto Gómez", departamento: "Calidad" }
            ]
          },
          {
            id: 3,
            codigo: "P202501-003",
            nombre: "Gerente de Recursos Humanos",
            descripcion: "Responsable de la gestión integral del capital humano, incluyendo reclutamiento, selección, capacitación, desarrollo y clima laboral.",
            departamento: "Recursos Humanos",
            supervisor: "Director General",
            estado: "activo",
            requisitos: "Conocimiento en legislación laboral, gestión por competencias y desarrollo organizacional.",
            funciones: "Diseñar e implementar políticas de RRHH\nSupervisar los procesos de reclutamiento y selección\nGestionar el plan de capacitación\nDesarrollar programas de evaluación de desempeño\nPromover un buen clima laboral",
            responsabilidades: "Asegurar el cumplimiento de la legislación laboral\nGarantizar la disponibilidad de personal competente\nPromover el desarrollo profesional\nMantener un clima laboral positivo",
            competencias: "Liderazgo\nEmpatía\nCapacidad de negociación\nVisión estratégica\nGestión de conflictos",
            formacion: "Licenciatura en Recursos Humanos, Psicología o afines",
            experiencia: "Mínimo 5 años en posiciones similares",
            personal: [
              { nombre: "Martín Rodríguez", departamento: "Recursos Humanos" }
            ]
          }
        ];
        
        try {
          // Intentar guardar los datos de ejemplo en Turso
          for (const puesto of puestosMuestra) {
            await client.execute({
              sql: `INSERT OR REPLACE INTO puestos 
                    (id, codigo, nombre, descripcion, departamento, supervisor, 
                     estado, requisitos, funciones, responsabilidades, 
                     competencias, formacion, experiencia, personal) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                puesto.id, 
                puesto.codigo || '', 
                puesto.nombre, 
                puesto.descripcion || '', 
                puesto.departamento || '', 
                puesto.supervisor || '', 
                puesto.estado || 'activo', 
                puesto.requisitos || '', 
                puesto.funciones || '', 
                puesto.responsabilidades || '', 
                puesto.competencias || '', 
                puesto.formacion || '', 
                puesto.experiencia || '', 
                JSON.stringify(puesto.personal || [])
              ]
            });
          }
          
          // Guardar en localStorage como respaldo
          localStorage.setItem("puestos", JSON.stringify(puestosMuestra));
          
          setPuestos(puestosMuestra);
        } catch (mockError) {
          console.error("Error al guardar datos de ejemplo en Turso:", mockError);
          // Si falla, usar los datos de ejemplo directamente
          localStorage.setItem("puestos", JSON.stringify(puestosMuestra));
          setPuestos(puestosMuestra);
        }
      }
    } catch (error) {
      console.error("Error al cargar puestos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los puestos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (puestoData) => {
    try {
      let updatedPuestos;
      const newId = selectedPuesto ? selectedPuesto.id : Date.now();
      const newPuesto = { 
        ...puestoData, 
        id: newId
      };
      
      // Intentar guardar en Turso
      try {
        await client.execute({
          sql: `INSERT OR REPLACE INTO puestos 
                (id, codigo, nombre, descripcion, departamento, supervisor, 
                 estado, requisitos, funciones, responsabilidades, 
                 competencias, formacion, experiencia, personal) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            newPuesto.id, 
            newPuesto.codigo || '', 
            newPuesto.nombre, 
            newPuesto.descripcion || '', 
            newPuesto.departamento || '', 
            newPuesto.supervisor || '', 
            newPuesto.estado || 'activo', 
            newPuesto.requisitos || '', 
            newPuesto.funciones || '', 
            newPuesto.responsabilidades || '', 
            newPuesto.competencias || '', 
            newPuesto.formacion || '', 
            newPuesto.experiencia || '', 
            JSON.stringify(newPuesto.personal || [])
          ]
        });
        
        // Recargar puestos desde Turso
        const result = await client.execute({
          sql: "SELECT * FROM puestos"
        });
        
        if (result.rows.length > 0) {
          // Procesar los datos para convertir campos JSON almacenados como texto
          updatedPuestos = result.rows.map(row => ({
            ...row,
            personal: row.personal ? JSON.parse(row.personal) : []
          }));
          
          // Actualizar también localStorage como respaldo
          localStorage.setItem("puestos", JSON.stringify(updatedPuestos));
        }
      } catch (dbError) {
        console.error("Error al guardar en Turso:", dbError);
        
        // Fallback a localStorage
        if (selectedPuesto) {
          updatedPuestos = puestos.map(p => 
            p.id === selectedPuesto.id ? newPuesto : p
          );
        } else {
          updatedPuestos = [...puestos, newPuesto];
        }
        localStorage.setItem("puestos", JSON.stringify(updatedPuestos));
      }
      
      setPuestos(updatedPuestos);
      setIsModalOpen(false);
      setSelectedPuesto(null);
      
      toast({
        title: selectedPuesto ? "Puesto actualizado" : "Puesto creado",
        description: selectedPuesto 
          ? "Los datos del puesto han sido actualizados exitosamente" 
          : "Se ha agregado un nuevo puesto exitosamente"
      });
    } catch (error) {
      console.error("Error al guardar puesto:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el puesto",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (puesto) => {
    setSelectedPuesto(puesto);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setPuestoToDelete(puestos.find(p => p.id === id));
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (!puestoToDelete) return;
      
      // Intentar eliminar de Turso
      try {
        await client.execute({
          sql: "DELETE FROM puestos WHERE id = ?",
          args: [puestoToDelete.id]
        });
        
        // Recargar puestos desde Turso
        const result = await client.execute({
          sql: "SELECT * FROM puestos"
        });
        
        if (result.rows.length >= 0) {
          // Procesar los datos para convertir campos JSON almacenados como texto
          const updatedPuestos = result.rows.map(row => ({
            ...row,
            personal: row.personal ? JSON.parse(row.personal) : []
          }));
          
          setPuestos(updatedPuestos);
          
          // Actualizar también localStorage como respaldo
          localStorage.setItem("puestos", JSON.stringify(updatedPuestos));
        }
      } catch (dbError) {
        console.error("Error al eliminar de Turso:", dbError);
        
        // Fallback a localStorage
        const updatedPuestos = puestos.filter(p => p.id !== puestoToDelete.id);
        setPuestos(updatedPuestos);
        localStorage.setItem("puestos", JSON.stringify(updatedPuestos));
      }
      
      toast({
        title: "Puesto eliminado",
        description: "El puesto ha sido eliminado exitosamente"
      });
      
      setDeleteDialogOpen(false);
      
      if (showSingle && currentPuesto?.id === puestoToDelete.id) {
        setShowSingle(false);
      }
    } catch (error) {
      console.error("Error al eliminar puesto:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el puesto",
        variant: "destructive"
      });
      setDeleteDialogOpen(false);
    }
  };

  const handleViewPuesto = (puesto) => {
    setCurrentPuesto(puesto);
    setShowSingle(true);
  };

  const filteredPuestos = puestos.filter(puesto =>
    puesto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    puesto.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    puesto.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showSingle) {
    return (
      <PuestoSingle
        puesto={currentPuesto}
        onBack={() => setShowSingle(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
              placeholder="Buscar puestos..."
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
          <Button onClick={() => {
            setSelectedPuesto(null);
            setIsModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Puesto
          </Button>
        </div>
      </div>

      {/* Lista de puestos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando puestos...</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPuestos.map((puesto) => (
              <motion.div
                key={puesto.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleViewPuesto(puesto)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold text-lg">{puesto.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{puesto.codigo}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      puesto.estado === "activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {puesto.estado}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{puesto.departamento || "No especificado"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Supervisor: {puesto.supervisor || "No especificado"}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm line-clamp-3">{puesto.descripcion}</p>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(puesto);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(puesto.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredPuestos.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No hay puestos registrados. Haz clic en "Nuevo Puesto" para comenzar.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-left p-4">Puesto</th>
                  <th className="text-left p-4">Departamento</th>
                  <th className="text-left p-4">Supervisor</th>
                  <th className="text-left p-4">Estado</th>
                  <th className="text-right p-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPuestos.map((puesto) => (
                  <motion.tr
                    key={puesto.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border cursor-pointer hover:bg-accent/50"
                    onClick={() => handleViewPuesto(puesto)}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{puesto.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {puesto.codigo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{puesto.departamento}</td>
                    <td className="p-4">{puesto.supervisor}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        puesto.estado === "activo"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {puesto.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(puesto);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(puesto.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredPuestos.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No hay puestos registrados. Haz clic en "Nuevo Puesto" para comenzar.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <PuestoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPuesto(null);
        }}
        onSave={handleSave}
        puesto={selectedPuesto}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el puesto {puestoToDelete?.nombre}.
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

export default PuestosListing;
