import React, { useState, useEffect } from "react";
import { createClient } from "@libsql/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  LayoutGrid,
  ListIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PersonalModal from "./PersonalModal";
import PersonalSingle from "./PersonalSingle";
import PersonalCard from "./PersonalCard";
import PersonalTableView from "./PersonalTableView";

function PersonalListing() {
  const { toast } = useToast();
  const [personal, setPersonal] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showSingleView, setShowSingleView] = useState(false);
  const [currentPerson, setCurrentPerson] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Cliente Turso con las credenciales correctas
  const client = createClient({
    url: "libsql://iso-muestra-104-sergiocharata1977.aws-us-east-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDY3OTgzMTUsImlkIjoiYjM2Y2MxYzYtY2I0NC00NzFkLWEyYjYtNGI5MTI0NjQ2MmE4IiwicmlkIjoiZDIyMDRlMGQtMTcxYy00NjhkLTliODUtYzNhYTYzNDlhZmI0In0.6FSA-ozXSMWU5XtSgul4oNQ6nzhA42IyX9emolZusfrO4aGP6xvn0p7cHmBHRtpwlTSxX4Tq-UVWaX5QUtdzAw"
  });

  useEffect(() => {
    loadPersonal();
  }, []);

  // Efecto para logging cuando el personal cambia
  useEffect(() => {
    console.log(`Personal cargado: ${personal.length} registros`);
  }, [personal]);

  const loadPersonal = async () => {
    try {
      setIsLoading(true);
      console.log("Cargando personal desde Turso...");
      
      const result = await client.execute({
        sql: 'SELECT * FROM personal'
      });
      
      console.log("Resultado de la consulta:", result);
      
      if (result.rows && result.rows.length > 0) {
        console.log(`Encontrados ${result.rows.length} registros de personal`);
        setPersonal(result.rows);
      } else {
        console.log("No se encontraron registros de personal");
        setPersonal([]);
      }
    } catch (error) {
      console.error("Error al cargar personal:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de personal",
        variant: "destructive"
      });
      setPersonal([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (personData) => {
    try {
      setIsLoading(true);
      
      // Determinar si es una creación o actualización
      const isUpdate = !!personData.id;
      
      if (isUpdate) {
        // Actualizar registro existente
        const fieldsToUpdate = [
          'nombre', 'puesto', 'departamento', 'email', 'telefono',
          'fecha_ingreso', 'documento_identidad', 'direccion',
          'formacion_academica', 'experiencia_laboral', 'competencias',
          'evaluacion_desempeno', 'capacitaciones_recibidas', 'observaciones',
          'updated_at'
        ];

        // Solo actualizar la imagen si se proporcionó una nueva
        if (personData.imagen) {
          fieldsToUpdate.push('imagen');
        }

        // Construir la consulta de actualización
        const setClause = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
        const values = fieldsToUpdate.map(field => {
          if (field === 'updated_at') return new Date().toISOString();
          return personData[field];
        });

        // Añadir el ID al final para la cláusula WHERE
        values.push(personData.id);

        await client.execute({
          sql: `UPDATE personal SET ${setClause} WHERE id = ?`,
          args: values
        });

        toast({
          title: "Éxito",
          description: "El registro se actualizó correctamente"
        });
      } else {
        // Crear nuevo registro
        const now = new Date().toISOString();
        const dataToInsert = {
          ...personData,
          created_at: now,
          updated_at: now
        };

        // Preparar campos y valores para la inserción
        const fields = Object.keys(dataToInsert).filter(key => dataToInsert[key] !== undefined);
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(field => dataToInsert[field]);

        await client.execute({
          sql: `INSERT INTO personal (${fields.join(', ')}) VALUES (${placeholders})`,
          args: values
        });

        toast({
          title: "Éxito",
          description: "El registro se creó correctamente"
        });
      }

      // Recargar la lista después de la operación
      await loadPersonal();
      setIsModalOpen(false);
      setSelectedPerson(null);
    } catch (error) {
      console.error("Error al guardar personal:", error);
      toast({
        title: "Error",
        description: `No se pudo ${personData.id ? 'actualizar' : 'crear'} el registro de personal`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (person) => {
    console.log("Ver detalles de:", person);
    setCurrentPerson(person);
    setShowSingleView(true);
  };

  const handleEdit = (person) => {
    console.log("Editar:", person);
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    console.log("Eliminar ID:", id);
    const personToRemove = personal.find(p => p.id === id);
    if (personToRemove) {
      setPersonToDelete(personToRemove);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      
      await client.execute({
        sql: 'DELETE FROM personal WHERE id = ?',
        args: [personToDelete.id]
      });
      
      toast({
        title: "Éxito",
        description: "El registro se eliminó correctamente"
      });
      
      await loadPersonal();
    } catch (error) {
      console.error("Error al eliminar personal:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de personal",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setPersonToDelete(null);
      setIsLoading(false);
      
      // Si estábamos en la vista detallada, volver al listado
      if (showSingleView) {
        setShowSingleView(false);
        setCurrentPerson(null);
      }
    }
  };

  const handleAddNew = () => {
    console.log("Agregar nuevo personal");
    setSelectedPerson(null);
    setIsModalOpen(true);
  };

  const handleBackFromSingle = () => {
    setShowSingleView(false);
    setCurrentPerson(null);
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredPersonal.length / itemsPerPage)) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Filtrar personal según término de búsqueda
  const filteredPersonal = personal.filter(person => 
    person.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.puesto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calcular total de páginas para paginación
  const totalPages = Math.ceil(filteredPersonal.length / itemsPerPage);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  
  // Obtener los registros para la página actual
  const paginatedPersonal = filteredPersonal.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Si estamos viendo la vista detallada de una persona
  if (showSingleView && currentPerson) {
    return (
      <PersonalSingle
        person={currentPerson}
        onBack={handleBackFromSingle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-4"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestión de Personal</h1>
          <div className="flex items-center space-x-3">
            <div className="bg-muted p-1 rounded-lg border flex items-center">
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm"
                className={viewMode === "grid" ? "shadow-sm" : ""}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span>Tarjetas</span>
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm"
                className={viewMode === "list" ? "shadow-sm" : ""}
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="h-4 w-4 mr-1" />
                <span>Lista</span>
              </Button>
            </div>
            <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Personal
            </Button>
          </div>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar personal..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : filteredPersonal.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No hay personal que coincida con tu búsqueda. 
                {searchTerm ? " Intenta con otros términos." : " Haz clic en 'Nuevo Personal' para comenzar."}
              </p>
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              <AnimatePresence>
                {paginatedPersonal.map(person => (
                  <PersonalCard
                    key={person.id}
                    person={person}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full overflow-auto"
            >
              <PersonalTableView 
                data={paginatedPersonal}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paginación */}
        {filteredPersonal.length > 0 && totalPages > 1 && (
          <div className="mt-4 flex justify-center items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={!hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={!hasNextPage}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Modal para crear/editar personal */}
      <PersonalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPerson(null);
        }}
        onSave={handleSave}
        person={selectedPerson}
      />

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de {personToDelete?.nombre}.
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
    </motion.div>
  );
}

export default PersonalListing;
