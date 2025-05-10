import { useState, useEffect } from 'react';
import { useTurso } from '../../context/TursoContext';
import { ClipboardList, Grid, List, Edit, Trash2, Plus, Search, User, Briefcase, AlertCircle, Upload, Camera } from 'lucide-react';
import Modal from '../common/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PersonalSingle from './PersonalSingle';

const PersonalList = () => {
  const { personalService, isLoading: contextLoading, error: contextError, dbConnected } = useTurso();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'card'
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  
  // Consulta para obtener personal
  const { 
    data: personal = [], 
    isLoading: loadingPersonal,
    error: personalError,
    refetch: refetchPersonal
  } = useQuery({
    queryKey: ['personal'],
    queryFn: async () => {
      if (!dbConnected) {
        console.log('Base de datos no conectada, esperando conexión...');
        return [];
      }
      console.log('Cargando datos de personal...');
      const result = await personalService.getPersonalConPuesto();
      console.log('Datos de personal cargados:', result);
      return result || [];
    },
    enabled: dbConnected,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false
  });
  
  // Consulta para obtener puestos
  const { 
    data: puestos = [], 
    isLoading: loadingPuestos,
    error: puestosError
  } = useQuery({
    queryKey: ['puestos'],
    queryFn: async () => {
      if (!dbConnected) return [];
      console.log('Cargando datos de puestos...');
      const result = await personalService.getAllPuestos();
      console.log('Datos de puestos cargados:', result);
      return result || [];
    },
    enabled: dbConnected,
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false
  });
  
  // Mutación para crear personal
  const createPersonalMutation = useMutation({
    mutationFn: (newPersonal) => personalService.createPersonal(newPersonal),
    onSuccess: () => {
      // Invalidar consultas y actualizar datos
      queryClient.invalidateQueries({ queryKey: ['personal'] });
      // Resetear formulario y cerrar modal
      resetForm();
      setModalOpen(false);
    },
    onError: (error) => {
      console.error('Error al crear personal:', error);
      setLocalError('Error al guardar los datos. Por favor, intenta de nuevo.');
    }
  });
  
  // Mutación para actualizar personal
  const updatePersonalMutation = useMutation({
    mutationFn: ({ id, data }) => personalService.updatePersonal(id, data),
    onSuccess: () => {
      // Invalidar consultas y actualizar datos
      queryClient.invalidateQueries({ queryKey: ['personal'] });
      // Resetear formulario y cerrar modal
      resetForm();
      setModalOpen(false);
    },
    onError: (error) => {
      console.error('Error al actualizar personal:', error);
      setLocalError('Error al actualizar los datos. Por favor, intenta de nuevo.');
    }
  });
  
  // Mutación para eliminar personal
  const deletePersonalMutation = useMutation({
    mutationFn: (id) => personalService.deletePersonal(id),
    onSuccess: () => {
      // Invalidar consultas y actualizar datos
      queryClient.invalidateQueries({ queryKey: ['personal'] });
      // Si estamos viendo la persona que se eliminó, volver a la lista
      if (selectedPersona && selectedPersona.id === id) {
        setSelectedPersona(null);
      }
    },
    onError: (error) => {
      console.error('Error al eliminar personal:', error);
      setLocalError('Error al eliminar el empleado. Por favor, intenta de nuevo.');
    }
  });
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    puesto_id: '',
    fecha_contratacion: '',
    estado: 'Activo',
    foto_url: ''
  });
  
  // Estado para modo edición
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar cambio de foto
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Crear una URL para la vista previa de la imagen
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      
      // Aquí normalmente subirías la imagen a un servicio de almacenamiento
      // y obtendrías una URL permanente. Para este ejemplo, usaremos la URL de vista previa.
      setFormData({
        ...formData,
        foto_url: previewUrl // En un caso real, esto sería la URL del servidor
      });
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        // Actualizar registro existente
        updatePersonalMutation.mutate({
          id: currentId,
          data: {
            ...formData,
            updated_at: new Date().toISOString()
          }
        });
      } else {
        // Crear nuevo registro
        createPersonalMutation.mutate({
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error al guardar datos:', err);
      setLocalError('Error al guardar los datos. Por favor, intenta de nuevo.');
    }
  };
  
  // Función para editar un registro
  const handleEdit = (empleado) => {
    setFormData({
      nombre: empleado.nombre || '',
      apellido: empleado.apellido || '',
      email: empleado.email || '',
      telefono: empleado.telefono || '',
      puesto_id: empleado.puesto_id ? empleado.puesto_id.toString() : '',
      fecha_contratacion: empleado.fecha_contratacion || '',
      estado: empleado.estado || 'Activo',
      foto_url: empleado.foto_url || ''
    });
    setPhotoPreview(empleado.foto_url || null);
    setEditMode(true);
    setCurrentId(empleado.id);
    setModalOpen(true);
  };
  
  // Función para eliminar un registro
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      deletePersonalMutation.mutate(id);
    }
  };
  
  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      puesto_id: '',
      fecha_contratacion: '',
      estado: 'Activo',
      foto_url: ''
    });
    setPhotoPreview(null);
    setEditMode(false);
    setCurrentId(null);
  };

  // Abrir modal para nuevo registro
  const handleOpenNewModal = () => {
    resetForm();
    setEditMode(false);
    setModalOpen(true);
  };
  
  // Ver detalle de persona (vista Single)
  const handleViewDetail = (persona) => {
    setSelectedPersona(persona);
  };
  
  // Volver a la lista desde la vista detallada
  const handleBackToList = () => {
    setSelectedPersona(null);
  };

  // Filtrar personal por término de búsqueda
  const filteredPersonal = personal.filter(empleado => {
    const searchString = `${empleado.nombre || ''} ${empleado.apellido || ''} ${empleado.puesto_nombre || ''} ${empleado.email || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Obtener color según estado del empleado
  const getStatusColor = (estado) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      case 'licencia':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Verificar si hay algún error
  const error = contextError || personalError || puestosError || localError;
  
  // Verificar si está cargando
  const isLoading = contextLoading || loadingPersonal || loadingPuestos || 
                   createPersonalMutation.isLoading || updatePersonalMutation.isLoading || 
                   deletePersonalMutation.isLoading;

  // Mostrar mensaje de error si no hay conexión a la base de datos
  if (!dbConnected && !contextLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="mr-2" />
          <span>No se pudo conectar a la base de datos. Por favor, verifica tu conexión a internet y recarga la página.</span>
        </div>
      </div>
    );
  }
  
  // Si hay una persona seleccionada, mostrar la vista detallada
  if (selectedPersona) {
    return (
      <PersonalSingle 
        persona={selectedPersona}
        onBack={handleBackToList}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Personal</h1>
        <div className="flex items-center space-x-4">
          {/* Botones de vista */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setViewMode('card')} 
              className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-white shadow' : ''}`}
            >
              <Grid size={20} />
            </button>
          </div>
          
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          {/* Botón para agregar */}
          <button
            onClick={handleOpenNewModal}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
            disabled={isLoading}
          >
            <Plus size={18} className="mr-2" />
            Nuevo Empleado
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Modal para crear/editar empleado */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editMode ? 'Editar Empleado' : 'Nuevo Empleado'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sección de foto de perfil */}
            <div className="md:col-span-2 flex justify-center mb-4">
              <div className="text-center">
                <div className="mb-2 relative inline-block">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Vista previa" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <Camera size={40} className="text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer">
                    <Upload size={16} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Foto de perfil</p>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Puesto</label>
              <select
                name="puesto_id"
                value={formData.puesto_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Seleccionar puesto</option>
                {puestos.map(puesto => (
                  <option key={puesto.id} value={puesto.id}>
                    {puesto.nombre} - {puesto.departamento}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Fecha de Contratación</label>
              <input
                type="date"
                name="fecha_contratacion"
                value={formData.fecha_contratacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Licencia">Licencia</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">URL de la foto (opcional)</label>
              <input
                type="text"
                name="foto_url"
                value={formData.foto_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : (editMode ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Vista de lista */}
      {viewMode === 'list' && (
        <div className="bg-white shadow-md rounded overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Foto</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Puesto</th>
                <th className="px-4 py-2 text-left">Departamento</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center">
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredPersonal.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center py-8">
                    No hay empleados disponibles
                  </td>
                </tr>
              ) : (
                filteredPersonal.map(empleado => (
                  <tr 
                    key={empleado.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewDetail(empleado)}
                  >
                    <td className="px-4 py-2">
                      {empleado.foto_url ? (
                        <img 
                          src={empleado.foto_url} 
                          alt={`${empleado.nombre} ${empleado.apellido}`} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={16} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {empleado.nombre} {empleado.apellido}
                    </td>
                    <td className="px-4 py-2">{empleado.puesto_nombre || '-'}</td>
                    <td className="px-4 py-2">{empleado.departamento || '-'}</td>
                    <td className="px-4 py-2">{empleado.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(empleado.estado)}`}>
                        {empleado.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(empleado);
                        }}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(empleado.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Vista de tarjetas */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredPersonal.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No hay empleados disponibles
            </div>
          ) : (
            filteredPersonal.map(empleado => (
              <div 
                key={empleado.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleViewDetail(empleado)}
              >
                <div className="bg-green-600 text-white p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {empleado.foto_url ? (
                        <img 
                          src={empleado.foto_url} 
                          alt={`${empleado.nombre} ${empleado.apellido}`} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-white mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3">
                          <User size={20} className="text-green-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{empleado.nombre} {empleado.apellido}</h3>
                        <p className="text-sm opacity-90">{empleado.puesto_nombre || 'Sin puesto asignado'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(empleado);
                        }}
                        className="p-1 hover:bg-green-700 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(empleado.id);
                        }}
                        className="p-1 hover:bg-green-700 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{empleado.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Briefcase size={16} className="text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Departamento</p>
                        <p className="font-medium">{empleado.departamento || '-'}</p>
                      </div>
                    </div>
                    {empleado.telefono && (
                      <div className="flex items-center">
                        <User size={16} className="text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="font-medium">{empleado.telefono}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(empleado.estado)}`}>
                        {empleado.estado}
                      </span>
                    </div>
                  </div>
                  
                  {empleado.fecha_contratacion && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Fecha de Contratación</p>
                      <p className="text-sm">{empleado.fecha_contratacion}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalList;
