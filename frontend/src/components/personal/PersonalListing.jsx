import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Download, 
  Pencil, 
  Trash2, 
  Users,
  LayoutGrid,
  List,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import PersonalModal from "./PersonalModal";
import PersonalSingle from "./PersonalSingle";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { createClient } from '@libsql/client';

const PersonalCard = React.memo(({ person, onView, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
    onClick={() => onView(person)}
  >
    <div className="aspect-square relative">
      <img 
        className="w-full h-full object-cover"
        alt={`Foto de ${person.nombre}`}
        src={person.imagen || "https://images.unsplash.com/photo-1578390432942-d323db577792"}
        loading="lazy"
      />
    </div>
    <div className="p-4">
      <h3 className="font-semibold">{person.nombre}</h3>
      <p className="text-sm text-muted-foreground">{person.puesto}</p>
      <p className="text-sm text-muted-foreground">{person.departamento}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(person);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(person.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </motion.div>
));

const PersonalSkeletonCard = () => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <Skeleton className="aspect-square" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

function PersonalListing() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSingle, setShowSingle] = useState(false);
  const [currentPerson, setCurrentPerson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [personal, setPersonal] = useState([]);

  // Cliente Turso
  const client = createClient({
    url: "libsql://iso103-1-sergiocharata1977.aws-us-east-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDUzMjMwMjIsImlkIjoiNmY3ZjA4ZmEtNTQ0My00ZjQ2LWI4MTMtYmZjY2JhYWJiOTc3IiwicmlkIjoiYzRhNDEzYWItZDdmNi00Y2I4LWEzZjktYjA2MDBmYzM0MjM3In0.gZSBIQ1Xki6KJmWrY_21DLN5mnc7S5dPdSf-NN3vl9MH9M43VOLF1VGKiqQPHeBmwAC6_28cFr1tST5gUlODCQ"
  });

  useEffect(() => {
    loadPersonal();
  }, []);

  const loadPersonal = async () => {
    try {
      setIsLoading(true);
      
      // Intentar cargar desde Turso primero
      try {
        const result = await client.execute({
          sql: 'SELECT * FROM personal'
        });
        
        if (result.rows.length > 0) {
          setPersonal(result.rows);
          setIsLoading(false);
          return;
        }
      } catch (dbError) {
        console.log("Fallback a localStorage:", dbError);
      }
      
      // Fallback a localStorage
      const saved = localStorage.getItem("personal");
      let data = saved ? JSON.parse(saved) : [];
      
      // Si no hay datos, crear datos de muestra
      if (data.length === 0) {
        data = [
          {
            id: 1,
            nombre: "Juan Pérez",
            puesto: "Gerente de Calidad",
            departamento: "Calidad",
            email: "juan.perez@empresa.com",
            telefono: "+34 123 456 789",
            fecha_contratacion: "2020-05-15",
            imagen: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          },
          {
            id: 2,
            nombre: "María López",
            puesto: "Analista de Procesos",
            departamento: "Operaciones",
            email: "maria.lopez@empresa.com",
            telefono: "+34 987 654 321",
            fecha_contratacion: "2019-10-20",
            imagen: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          },
          {
            id: 3,
            nombre: "Carlos Rodríguez",
            puesto: "Auditor Interno",
            departamento: "Calidad",
            email: "carlos.rodriguez@empresa.com",
            telefono: "+34 654 321 987",
            fecha_contratacion: "2021-03-10",
            imagen: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          }
        ];
        
        // Guardar datos de muestra en localStorage
        localStorage.setItem("personal", JSON.stringify(data));
        
        // Intentar guardar los datos de muestra en Turso
        try {
          for (const person of data) {
            await savePersonToTurso(person);
          }
        } catch (error) {
          console.error("Error saving sample data to Turso:", error);
        }
      }
      
      setPersonal(data);
    } catch (error) {
      console.error("Error loading personal:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de personal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePersonToTurso = async (person) => {
    try {
      // Verificar si la persona ya existe
      const checkResult = await client.execute({
        sql: 'SELECT id FROM personal WHERE id = ?',
        args: [person.id]
      });

      if (checkResult.rows.length > 0) {
        // Actualizar
        await client.execute({
          sql: `UPDATE personal SET 
                nombre = ?, 
                puesto = ?, 
                departamento = ?, 
                email = ?, 
                telefono = ?, 
                fecha_contratacion = ?, 
                imagen = ? 
                WHERE id = ?`,
          args: [
            person.nombre,
            person.puesto,
            person.departamento,
            person.email,
            person.telefono,
            person.fecha_contratacion,
            person.imagen,
            person.id
          ]
        });
      } else {
        // Insertar
        await client.execute({
          sql: `INSERT INTO personal (
                id, 
                nombre, 
                puesto, 
                departamento, 
                email, 
                telefono, 
                fecha_contratacion, 
                imagen
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            person.id,
            person.nombre,
            person.puesto,
            person.departamento,
            person.email,
            person.telefono,
            person.fecha_contratacion,
            person.imagen
          ]
        });
      }
      return true;
    } catch (error) {
      console.error("Error saving to Turso:", error);
      return false;
    }
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredPersonal = React.useMemo(() => {
    return personal.filter(person =>
      person.nombre?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      person.puesto?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      person.departamento?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [personal, debouncedSearchTerm]);

  const {
    currentPage,
    currentItems: paginatedPersonal,
    totalPages,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage
  } = usePagination(filteredPersonal, 10);

  const handleSave = async (personData) => {
    try {
      setIsLoading(true);
      let updatedPersonal;
      let savedPerson;
      
      // Obtener todos los registros para actualizar localStorage
      const saved = localStorage.getItem("personal");
      const allPersonal = saved ? JSON.parse(saved) : [];
      
      if (selectedPerson) {
        savedPerson = { ...personData, id: selectedPerson.id };
        
        // Actualizar el estado local
        updatedPersonal = personal.map(p => 
          p.id === selectedPerson.id ? savedPerson : p
        );
        
        // Actualizar localStorage
        const updatedAllPersonal = allPersonal.map(p => 
          p.id === selectedPerson.id ? savedPerson : p
        );
        
        toast({
          title: "Personal actualizado",
          description: "Los datos del personal han sido actualizados exitosamente"
        });
        
        // Guardar en Turso
        const tursoSaved = await savePersonToTurso(savedPerson);
        if (!tursoSaved) {
          // Fallback a localStorage si falla Turso
          localStorage.setItem("personal", JSON.stringify(updatedAllPersonal));
        }
      } else {
        savedPerson = { ...personData, id: Date.now() };
        
        // Actualizar el estado local
        updatedPersonal = [...personal, savedPerson];
        
        // Actualizar localStorage
        const updatedAllPersonal = [...allPersonal, savedPerson];
        
        toast({
          title: "Personal creado",
          description: "Se ha agregado un nuevo personal exitosamente"
        });
        
        // Guardar en Turso
        const tursoSaved = await savePersonToTurso(savedPerson);
        if (!tursoSaved) {
          // Fallback a localStorage si falla Turso
          localStorage.setItem("personal", JSON.stringify(updatedAllPersonal));
        }
      }
      
      setPersonal(updatedPersonal);
      setIsModalOpen(false);
      setSelectedPerson(null);
    } catch (error) {
      console.error("Error saving personal:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el personal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (person) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const person = personal.find(p => p.id === id);
    setPersonToDelete(person);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!personToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Intentar eliminar de Turso primero
      try {
        await client.execute({
          sql: 'DELETE FROM personal WHERE id = ?',
          args: [personToDelete.id]
        });
      } catch (dbError) {
        console.log("Fallback a localStorage para eliminar:", dbError);
      }
      
      // Actualizar estado local
      const updatedPersonal = personal.filter(p => p.id !== personToDelete.id);
      setPersonal(updatedPersonal);
      
      // Actualizar localStorage
      const saved = localStorage.getItem("personal");
      const allPersonal = saved ? JSON.parse(saved) : [];
      const updatedAllPersonal = allPersonal.filter(p => p.id !== personToDelete.id);
      localStorage.setItem("personal", JSON.stringify(updatedAllPersonal));
      
      toast({
        title: "Personal eliminado",
        description: "El personal ha sido eliminado exitosamente"
      });
      
      setDeleteDialogOpen(false);
      setPersonToDelete(null);
    } catch (error) {
      console.error("Error deleting personal:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el personal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPerson = (person) => {
    setCurrentPerson(person);
    setShowSingle(true);
  };

  // Si estamos viendo los detalles de una persona
  if (showSingle && currentPerson) {
    return (
      <PersonalSingle
        person={currentPerson}
        onBack={() => setShowSingle(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Personal</h2>

      <motion.div layout className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <PersonalSkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar personal..."
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
                  setSelectedPerson(null);
                  setIsModalOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Personal
                </Button>
              </div>
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedPersonal.map((person) => (
                  <PersonalCard
                    key={person.id}
                    person={person}
                    onView={handleViewPerson}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
                {paginatedPersonal.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      No hay personal registrado. Haz clic en "Nuevo Personal" para comenzar.
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
                      <th className="text-left p-4">Nombre</th>
                      <th className="text-left p-4 hidden md:table-cell">Puesto</th>
                      <th className="text-left p-4 hidden lg:table-cell">Departamento</th>
                      <th className="text-left p-4 hidden xl:table-cell">Email</th>
                      <th className="text-left p-4 hidden xl:table-cell">Teléfono</th>
                      <th className="text-right p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPersonal.map((person) => (
                      <motion.tr
                        key={person.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border cursor-pointer hover:bg-accent/50"
                        onClick={() => handleViewPerson(person)}
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                              <img
                                src={person.imagen || "https://images.unsplash.com/photo-1578390432942-d323db577792"}
                                alt={person.nombre}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">{person.nombre}</span>
                              <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">{person.puesto}</td>
                        <td className="p-4 hidden lg:table-cell">{person.departamento}</td>
                        <td className="p-4 hidden xl:table-cell">{person.email}</td>
                        <td className="p-4 hidden xl:table-cell">{person.telefono}</td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(person);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(person.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {paginatedPersonal.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      No hay personal registrado. Haz clic en "Nuevo Personal" para comenzar.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
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
          </>
        )}
      </motion.div>

      {/* Modals */}
      <PersonalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPerson(null);
        }}
        onSave={handleSave}
        person={selectedPerson}
      />

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
    </div>
  );
}

export default PersonalListing;
