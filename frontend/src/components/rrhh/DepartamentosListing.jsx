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
  Building,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List
} from "lucide-react";
import DepartamentoModal from "./DepartamentoModal";
import DepartamentoSingle from "./DepartamentoSingle";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

// Cliente de Turso
const client = createClient({
  url: "libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ"
});

function DepartamentosListing() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDepts, setExpandedDepts] = useState([]);
  const [showSingle, setShowSingle] = useState(false);
  const [currentDepartamento, setCurrentDepartamento] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departamentoToDelete, setDepartamentoToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [departamentos, setDepartamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDepartamentos();
  }, []);

  const loadDepartamentos = async () => {
    try {
      setIsLoading(true);
      
      // Intentar cargar desde Turso
      try {
        const result = await client.execute({
          sql: "SELECT * FROM departamentos"
        });
        
        if (result.rows.length > 0) {
          // Procesar los datos para convertir campos JSON almacenados como texto
          const processedData = result.rows.map(row => ({
            ...row,
            subdepartamentos: row.subdepartamentos ? JSON.parse(row.subdepartamentos) : [],
            personal: row.personal ? JSON.parse(row.personal) : []
          }));
          
          setDepartamentos(processedData);
          setIsLoading(false);
          return;
        }
      } catch (dbError) {
        console.error("Error al cargar desde Turso:", dbError);
      }
      
      // Si no se pudo cargar desde Turso, intentar desde localStorage
      const saved = localStorage.getItem("departamentos");
      let initialData = saved ? JSON.parse(saved) : [];
      
      // Si hay datos en localStorage, intentar sincronizarlos con Turso
      if (initialData.length > 0) {
        try {
          for (const dept of initialData) {
            await client.execute({
              sql: `INSERT OR REPLACE INTO departamentos 
                    (id, nombre, responsable, descripcion, objetivos, email, 
                     telefono, ubicacion, presupuesto, fecha_creacion, 
                     departamento_padre_id, subdepartamentos, personal) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                dept.id, 
                dept.nombre, 
                dept.responsable || '', 
                dept.descripcion || '', 
                dept.objetivos || '', 
                dept.email || '', 
                dept.telefono || '', 
                dept.ubicacion || '', 
                dept.presupuesto || '', 
                dept.fechaCreacion || '', 
                dept.departamentoPadreId || null, 
                JSON.stringify(dept.subdepartamentos || []), 
                JSON.stringify(dept.personal || [])
              ]
            });
          }
          
          setDepartamentos(initialData);
        } catch (syncError) {
          console.error("Error al sincronizar con Turso:", syncError);
          setDepartamentos(initialData);
        }
      } else {
        // Si no hay datos, crear datos de ejemplo
        const departamentosEjemplo = [
          {
            id: 1,
            nombre: "Dirección General",
            responsable: "Carlos Martínez",
            descripcion: "Departamento encargado de la dirección estratégica de la empresa, definición de políticas y toma de decisiones de alto nivel.",
            objetivos: "- Asegurar el cumplimiento de la misión y visión de la empresa\n- Definir y revisar la política de calidad\n- Establecer objetivos estratégicos\n- Asignar recursos para el SGC",
            email: "direccion@empresa.com",
            telefono: "+54 11 5555-1000",
            ubicacion: "Piso 10, Oficina 1001",
            presupuesto: "1,500,000",
            fechaCreacion: "2020-01-01",
            departamentoPadreId: null,
            subdepartamentos: [
              { id: 2, nombre: "Calidad" },
              { id: 3, nombre: "Recursos Humanos" }
            ],
            personal: [
              { nombre: "Carlos Martínez", puesto: "Director General" },
              { nombre: "Laura Sánchez", puesto: "Asistente de Dirección" }
            ]
          },
          {
            id: 2,
            nombre: "Calidad",
            responsable: "Ana López",
            descripcion: "Departamento responsable de implementar, mantener y mejorar el Sistema de Gestión de Calidad, asegurando el cumplimiento de los requisitos de la norma ISO 9001.",
            objetivos: "- Mantener la certificación ISO 9001\n- Reducir no conformidades en un 20%\n- Mejorar la satisfacción del cliente\n- Optimizar los procesos internos",
            email: "calidad@empresa.com",
            telefono: "+54 11 5555-1001",
            ubicacion: "Piso 8, Oficina 805",
            presupuesto: "500,000",
            fechaCreacion: "2020-02-15",
            departamentoPadreId: 1,
            subdepartamentos: [],
            personal: [
              { nombre: "Ana López", puesto: "Gerente de Calidad" },
              { nombre: "Roberto Gómez", puesto: "Auditor Interno" }
            ]
          },
          {
            id: 3,
            nombre: "Recursos Humanos",
            responsable: "Martín Rodríguez",
            descripcion: "Departamento encargado de la gestión del personal, incluyendo reclutamiento, selección, capacitación, evaluación de desempeño y clima laboral.",
            objetivos: "- Reducir la rotación de personal en un 15%\n- Implementar plan de capacitación anual\n- Mejorar el clima laboral\n- Optimizar procesos de selección",
            email: "rrhh@empresa.com",
            telefono: "+54 11 5555-1002",
            ubicacion: "Piso 7, Oficina 703",
            presupuesto: "600,000",
            fechaCreacion: "2020-02-15",
            departamentoPadreId: 1,
            subdepartamentos: [
              { id: 4, nombre: "Capacitación" },
              { id: 5, nombre: "Selección" }
            ],
            personal: [
              { nombre: "Martín Rodríguez", puesto: "Gerente de RRHH" },
              { nombre: "Julia Fernández", puesto: "Analista de RRHH" }
            ]
          },
          {
            id: 4,
            nombre: "Capacitación",
            responsable: "Julia Fernández",
            descripcion: "Área encargada de diseñar e implementar programas de capacitación para el personal de la empresa.",
            objetivos: "- Ejecutar el plan anual de capacitación\n- Evaluar la eficacia de las capacitaciones\n- Identificar necesidades de formación",
            email: "capacitacion@empresa.com",
            telefono: "+54 11 5555-1003",
            ubicacion: "Piso 7, Oficina 704",
            presupuesto: "250,000",
            fechaCreacion: "2020-03-01",
            departamentoPadreId: 3,
            subdepartamentos: [],
            personal: [
              { nombre: "Julia Fernández", puesto: "Coordinadora de Capacitación" }
            ]
          },
          {
            id: 5,
            nombre: "Selección",
            responsable: "Pedro Gómez",
            descripcion: "Área encargada del reclutamiento y selección de personal según los perfiles requeridos por la empresa.",
            objetivos: "- Optimizar los tiempos de selección\n- Mejorar la adecuación persona-puesto\n- Reducir la rotación temprana",
            email: "seleccion@empresa.com",
            telefono: "+54 11 5555-1004",
            ubicacion: "Piso 7, Oficina 705",
            presupuesto: "200,000",
            fechaCreacion: "2020-03-01",
            departamentoPadreId: 3,
            subdepartamentos: [],
            personal: [
              { nombre: "Pedro Gómez", puesto: "Coordinador de Selección" }
            ]
          }
        ];
        
        try {
          // Intentar guardar los datos de ejemplo en Turso
          for (const dept of departamentosEjemplo) {
            await client.execute({
              sql: `INSERT OR REPLACE INTO departamentos 
                    (id, nombre, responsable, descripcion, objetivos, email, 
                     telefono, ubicacion, presupuesto, fecha_creacion, 
                     departamento_padre_id, subdepartamentos, personal) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                dept.id, 
                dept.nombre, 
                dept.responsable || '', 
                dept.descripcion || '', 
                dept.objetivos || '', 
                dept.email || '', 
                dept.telefono || '', 
                dept.ubicacion || '', 
                dept.presupuesto || '', 
                dept.fechaCreacion || '', 
                dept.departamentoPadreId || null, 
                JSON.stringify(dept.subdepartamentos || []), 
                JSON.stringify(dept.personal || [])
              ]
            });
          }
          
          // Guardar en localStorage como respaldo
          localStorage.setItem("departamentos", JSON.stringify(departamentosEjemplo));
          
          setDepartamentos(departamentosEjemplo);
        } catch (mockError) {
          console.error("Error al guardar datos de ejemplo en Turso:", mockError);
          // Si falla, usar los datos de ejemplo directamente
          localStorage.setItem("departamentos", JSON.stringify(departamentosEjemplo));
          setDepartamentos(departamentosEjemplo);
        }
      }
    } catch (error) {
      console.error("Error al cargar departamentos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los departamentos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDepartamento = (id) => {
    setExpandedDepts(prev => {
      if (prev.includes(id)) {
        return prev.filter(deptId => deptId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSave = async (departamentoData) => {
    try {
      let updatedDepartamentos;
      const newId = selectedDepartamento ? selectedDepartamento.id : Date.now();
      const newDepartamento = { 
        ...departamentoData, 
        id: newId
      };
      
      // Intentar guardar en Turso
      try {
        await client.execute({
          sql: `INSERT OR REPLACE INTO departamentos 
                (id, nombre, responsable, descripcion, objetivos, email, 
                 telefono, ubicacion, presupuesto, fecha_creacion, 
                 departamento_padre_id, subdepartamentos, personal) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            newDepartamento.id, 
            newDepartamento.nombre, 
            newDepartamento.responsable || '', 
            newDepartamento.descripcion || '', 
            newDepartamento.objetivos || '', 
            newDepartamento.email || '', 
            newDepartamento.telefono || '', 
            newDepartamento.ubicacion || '', 
            newDepartamento.presupuesto || '', 
            newDepartamento.fechaCreacion || '', 
            newDepartamento.departamentoPadreId || null, 
            JSON.stringify(newDepartamento.subdepartamentos || []), 
            JSON.stringify(newDepartamento.personal || [])
          ]
        });
        
        // Recargar departamentos desde Turso
        const result = await client.execute({
          sql: "SELECT * FROM departamentos"
        });
        
        if (result.rows.length > 0) {
          // Procesar los datos para convertir campos JSON almacenados como texto
          updatedDepartamentos = result.rows.map(row => ({
            ...row,
            subdepartamentos: row.subdepartamentos ? JSON.parse(row.subdepartamentos) : [],
            personal: row.personal ? JSON.parse(row.personal) : []
          }));
          
          // Actualizar también localStorage como respaldo
          localStorage.setItem("departamentos", JSON.stringify(updatedDepartamentos));
        }
      } catch (dbError) {
        console.error("Error al guardar en Turso:", dbError);
        
        // Fallback a localStorage
        if (selectedDepartamento) {
          updatedDepartamentos = departamentos.map(d => 
            d.id === selectedDepartamento.id ? newDepartamento : d
          );
        } else {
          updatedDepartamentos = [...departamentos, newDepartamento];
        }
        localStorage.setItem("departamentos", JSON.stringify(updatedDepartamentos));
      }
      
      setDepartamentos(updatedDepartamentos);
      setIsModalOpen(false);
      setSelectedDepartamento(null);
      
      toast({
        title: selectedDepartamento ? "Departamento actualizado" : "Departamento creado",
        description: selectedDepartamento 
          ? "Los datos del departamento han sido actualizados exitosamente" 
          : "Se ha agregado un nuevo departamento exitosamente"
      });
    } catch (error) {
      console.error("Error al guardar departamento:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el departamento",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (id) => {
    setDepartamentoToDelete(departamentos.find(d => d.id === id));
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (!departamentoToDelete) return;
      
      // Verificar si tiene subdepartamentos
      const tieneSubdepartamentos = departamentos.some(d => d.departamentoPadreId === departamentoToDelete.id);
      
      if (tieneSubdepartamentos) {
        toast({
          title: "No se puede eliminar",
          description: "Este departamento tiene subdepartamentos asociados. Elimine primero los subdepartamentos.",
          variant: "destructive"
        });
        setDeleteDialogOpen(false);
        return;
      }
      
      // Intentar eliminar de Turso
      try {
        await client.execute({
          sql: "DELETE FROM departamentos WHERE id = ?",
          args: [departamentoToDelete.id]
        });
        
        // Recargar departamentos desde Turso
        const result = await client.execute({
          sql: "SELECT * FROM departamentos"
        });
        
        if (result.rows.length >= 0) {
          // Procesar los datos para convertir campos JSON almacenados como texto
          const updatedDepartamentos = result.rows.map(row => ({
            ...row,
            subdepartamentos: row.subdepartamentos ? JSON.parse(row.subdepartamentos) : [],
            personal: row.personal ? JSON.parse(row.personal) : []
          }));
          
          setDepartamentos(updatedDepartamentos);
          
          // Actualizar también localStorage como respaldo
          localStorage.setItem("departamentos", JSON.stringify(updatedDepartamentos));
        }
      } catch (dbError) {
        console.error("Error al eliminar de Turso:", dbError);
        
        // Fallback a localStorage
        const updatedDepartamentos = departamentos.filter(d => d.id !== departamentoToDelete.id);
        
        // Actualizar los subdepartamentos de otros departamentos
        departamentos.forEach(dept => {
          if (dept.subdepartamentos) {
            dept.subdepartamentos = dept.subdepartamentos.filter(sub => sub.id !== departamentoToDelete.id);
          }
        });
        
        setDepartamentos(updatedDepartamentos);
        localStorage.setItem("departamentos", JSON.stringify(updatedDepartamentos));
      }
      
      toast({
        title: "Departamento eliminado",
        description: "El departamento ha sido eliminado exitosamente"
      });
      
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error al eliminar departamento:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el departamento",
        variant: "destructive"
      });
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = (departamento) => {
    setSelectedDepartamento(departamento);
    setIsModalOpen(true);
  };

  const handleViewDepartamento = (departamento) => {
    setCurrentDepartamento(departamento);
    setShowSingle(true);
  };

  const renderDepartamento = (departamento, level = 0) => {
    const isExpanded = expandedDepts.includes(departamento.id);
    const hasChildren = departamentos.some(d => d.departamentoPadreId === departamento.id);
    const childDepartamentos = departamentos.filter(d => d.departamentoPadreId === departamento.id);
    
    return (
      <div key={departamento.id} className="border-b border-gray-200 last:border-b-0">
        <div 
          className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer ${level > 0 ? 'pl-' + (level * 8 + 4) + 'px' : ''}`}
          onClick={() => handleViewDepartamento(departamento)}
        >
          <div className="flex items-center">
            {hasChildren && (
              <button
                className="mr-2 p-1 rounded-full hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDepartamento(departamento.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{departamento.nombre}</h3>
                <p className="text-sm text-muted-foreground">
                  {departamento.responsable}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(departamento);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(departamento.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDepartamento(departamento);
              }}
            >
              <span className="mr-1">Ver detalles</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isExpanded && childDepartamentos.length > 0 && (
          <div className="border-t border-gray-100">
            {childDepartamentos.map(child => renderDepartamento(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderDepartamentoGrid = (departamento) => {
    return (
      <motion.div
        key={departamento.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
        onClick={() => handleViewDepartamento(departamento)}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{departamento.nombre}</h3>
              <p className="text-xs text-muted-foreground">
                {departamento.responsable}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {departamento.descripcion}
          </p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm flex items-center">
              <Building className="h-4 w-4 mr-1 text-muted-foreground" />
              {departamento.departamentoPadreId ? 
                departamentos.find(d => d.id === departamento.departamentoPadreId)?.nombre || "Sin departamento padre" : 
                "Departamento principal"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center">
              {departamento.personal?.length || 0} miembros
            </span>
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
              handleEdit(departamento);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(departamento.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const filteredDepartamentos = departamentos.filter(departamento =>
    departamento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departamento.responsable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rootDepartamentos = filteredDepartamentos.filter(d => !d.departamentoPadreId);

  if (showSingle) {
    // Enriquecer el departamento con información adicional
    const departamentoCompleto = { ...currentDepartamento };
    
    // Agregar subdepartamentos
    departamentoCompleto.subdepartamentos = departamentos
      .filter(d => d.departamentoPadreId === currentDepartamento.id)
      .map(d => ({ id: d.id, nombre: d.nombre }));
    
    // Agregar nombre del departamento padre si existe
    if (departamentoCompleto.departamentoPadreId) {
      const departamentoPadre = departamentos.find(d => d.id === departamentoCompleto.departamentoPadreId);
      if (departamentoPadre) {
        departamentoCompleto.departamentoPadreNombre = departamentoPadre.nombre;
      }
    }
    
    return (
      <DepartamentoSingle
        departamento={departamentoCompleto}
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
        <h1 className="text-2xl font-bold">Departamentos</h1>
        <Button onClick={() => {
          setSelectedDepartamento(null);
          setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Departamento
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
              placeholder="Buscar departamentos..."
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

      {/* Lista de departamentos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartamentos.map(departamento => renderDepartamentoGrid(departamento))}
            {filteredDepartamentos.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No hay departamentos registrados. Haz clic en "Nuevo Departamento" para comenzar.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {rootDepartamentos.map(departamento => renderDepartamento(departamento))}
            {rootDepartamentos.length === 0 && (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No hay departamentos registrados. Haz clic en "Nuevo Departamento" para comenzar.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <DepartamentoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDepartamento(null);
        }}
        onSave={handleSave}
        departamento={selectedDepartamento}
        departamentos={departamentos}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el departamento {departamentoToDelete?.nombre}.
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

export default DepartamentosListing;
