import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ClipboardList, 
  FileText, 
  Users, 
  BarChart2,
  Calendar,
  Bell,
  BookOpen,
  FileCheck,
  Settings,
  Building2,
  Briefcase,
  Target,
  Activity,
  LineChart,
  Clipboard,
  UserCheck,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  ClipboardCheck,
  MessageSquare,
  BarChart,
  ArrowUpCircle,
  Package
} from 'lucide-react';

// Importar componentes de dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Importar directamente nuestros componentes
import PersonalListing from '../personal/PersonalListing';
import AuditoriasList from '../auditorias/AuditoriasList';
import NormasList from '../normas/NormasList';
import DocumentosList from '../documentos/DocumentosList';
import SectionPlaceholder from '../common/SectionPlaceholder';
import UsuariosListing from '../usuarios/UsuariosListing';
import ProcesosListing from '../procesos/ProcesosListing';
import ObjetivosListing from '../procesos/ObjetivosListing';
import IndicadoresListing from '../procesos/IndicadoresListing';
import MedicionesListing from '../procesos/MedicionesListing';
import DepartamentosListing from '../rrhh/DepartamentosListing';
import PuestosListing from '../rrhh/PuestosListing';
import CapacitacionesListing from '../rrhh/CapacitacionesListing';
import EvaluacionesListing from '../rrhh/EvaluacionesListing';
import TicketsListing from '../tickets/TicketsListing';
import EncuestasListing from '../encuestas/EncuestasListing';
import MejorasListing from '../mejoras/MejorasListing';
import NoticiasListing from '../noticias/NoticiasListing';
import ProductosListing from '../productos/ProductosListing';

const MenuPrincipal = ({ onLogout }) => {
  const [selectedSection, setSelectedSection] = useState('noticias');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSectionChange = (id) => {
    setSelectedSection(id);
  };

  const renderSection = () => {
    if (!selectedSection) {
      return (
        <div className="flex items-center justify-center h-full">
          <h2 className="text-xl font-semibold text-gray-700">Seleccione una opción del menú</h2>
        </div>
      );
    }

    // Renderizar componentes directamente
    switch(selectedSection) {
      case 'noticias':
        return <NoticiasListing />;
      case 'personal':
        return <PersonalListing />;
      case 'auditorias':
        return <AuditoriasList />;
      case 'normas':
        return <NormasList />;
      case 'documentos':
        return <DocumentosList />;
      case 'usuarios':
        return <UsuariosListing />;
      case 'procesos':
        return <ProcesosListing />;
      case 'objetivos':
        return <ObjetivosListing />;
      case 'indicadores':
        return <IndicadoresListing />;
      case 'mediciones':
        return <MedicionesListing />;
      case 'departamentos':
        return <DepartamentosListing />;
      case 'puestos':
        return <PuestosListing />;
      case 'capacitaciones':
        return <CapacitacionesListing />;
      case 'evaluaciones':
        return <EvaluacionesListing />;
      case 'tickets':
        return <TicketsListing />;
      case 'encuestas':
        return <EncuestasListing />;
      case 'mejoras':
        return <MejorasListing />;
      case 'productos':
        return <ProductosListing />;
      default:
        return <SectionPlaceholder sectionName={selectedSection} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white h-full overflow-y-auto">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center mr-3">
              <span className="text-white font-bold">SGC</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Los Señores del Agro</h2>
              <p className="text-xs text-gray-400">Sistema de Gestión de Calidad</p>
            </div>
          </div>
        </div>
        
        {/* Información del usuario */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center mr-2">
              <span className="text-white font-bold">{currentUser?.name?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">{currentUser?.name || 'Usuario'}</h3>
              <p className="text-xs text-gray-400">{currentUser?.role || 'Sin rol'}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
              if (onLogout) onLogout();
            }}
            className="w-full text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded transition duration-150 ease-in-out"
          >
            Cerrar sesión
          </button>
        </div>
        
        <div className="mt-4">
          {/* Opciones de menú individuales */}
          <button
            onClick={() => handleSectionChange('noticias')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === 'noticias' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Bell className="h-5 w-5 mr-2" />
            <span>Noticias</span>
          </button>
          
          <button
            onClick={() => handleSectionChange('tablero')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === 'tablero' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <BarChart2 className="h-5 w-5 mr-2" />
            <span>Tablero Central</span>
          </button>
          
          <button
            onClick={() => handleSectionChange('calendario')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === 'calendario' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Calendar className="h-5 w-5 mr-2" />
            <span>Calendario</span>
          </button>
          
          {/* Recursos Humanos - Ahora con dropdown */}
          <div className="mt-2 px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
            Recursos Humanos
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center w-full px-4 py-2 text-left ${
                  ['personal', 'departamentos', 'puestos', 'capacitaciones', 'evaluaciones'].includes(selectedSection) 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Users className="h-5 w-5 mr-2" />
                <span>Recursos Humanos</span>
                <ChevronDown className="h-4 w-4 ml-auto" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-gray-900 text-gray-300 border-gray-700"
              side="right"
              sideOffset={5}
            >
              <DropdownMenuItem 
                className="hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white px-4 py-3 text-base"
                onClick={() => handleSectionChange('personal')}
              >
                <Users className="h-5 w-5 mr-3" />
                <span>Personal</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white px-4 py-3 text-base"
                onClick={() => handleSectionChange('departamentos')}
              >
                <Building2 className="h-5 w-5 mr-3" />
                <span>Departamentos</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white px-4 py-3 text-base"
                onClick={() => handleSectionChange('puestos')}
              >
                <Briefcase className="h-5 w-5 mr-3" />
                <span>Puestos</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white px-4 py-3 text-base"
                onClick={() => handleSectionChange('capacitaciones')}
              >
                <GraduationCap className="h-5 w-5 mr-3" />
                <span>Capacitaciones</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white px-4 py-3 text-base"
                onClick={() => handleSectionChange('evaluaciones')}
              >
                <ClipboardCheck className="h-5 w-5 mr-3" />
                <span>Evaluaciones</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Sistema de Gestión */}
          <div className="mt-2 px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
            Sistema de Gestión
          </div>
          
          {/* Procesos - Ahora con dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center w-full px-4 py-2 text-left ${
                  ['procesos', 'objetivos', 'indicadores', 'mediciones', 'mejoras'].includes(selectedSection) 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Activity className="h-5 w-5 mr-2" />
                <span>Procesos</span>
                <ChevronDown className="h-4 w-4 ml-auto" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-gray-900 text-gray-300 border-gray-700"
              side="right"
              sideOffset={5}
            >
              <DropdownMenuItem 
                className="hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white px-4 py-3 text-base"
                onClick={() => handleSectionChange('procesos')}
              >
                <Activity className="h-5 w-5 mr-3" />
                <span>Procesos</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white px-4 py-3 text-base"
                onClick={() => handleSectionChange('objetivos')}
              >
                <Target className="h-5 w-5 mr-3" />
                <span>Objetivos</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white px-4 py-3 text-base"
                onClick={() => handleSectionChange('indicadores')}
              >
                <BarChart className="h-5 w-5 mr-3" />
                <span>Indicadores</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white px-4 py-3 text-base"
                onClick={() => handleSectionChange('mediciones')}
              >
                <LineChart className="h-5 w-5 mr-3" />
                <span>Mediciones</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white px-4 py-3 text-base"
                onClick={() => handleSectionChange('mejoras')}
              >
                <ArrowUpCircle className="h-5 w-5 mr-3" />
                <span>Mejoras</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button
            onClick={() => handleSectionChange('documentos')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === 'documentos' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <FileText className="h-5 w-5 mr-2" />
            <span>Documentos</span>
          </button>
          
          <button
            onClick={() => handleSectionChange('normas')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === 'normas' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            <span>Puntos de Norma</span>
          </button>
          
          {/* Planificación y Desarrollo de Productos */}
          <div className="mt-2 px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
            Planificación y Desarrollo de Productos
          </div>
          
          <button
            onClick={() => handleSectionChange('productos')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === 'productos' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Package className="h-5 w-5 mr-2" />
            <span>Productos</span>
          </button>
          
          {/* Satisfacción */}
          <div className="mt-2 px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
            Satisfacción
          </div>
          
          <button
            onClick={() => handleSectionChange('tickets')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === 'tickets' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            <span>Tickets</span>
          </button>
          
          <button
            onClick={() => handleSectionChange('encuestas')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === 'encuestas' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <BarChart className="h-5 w-5 mr-2" />
            <span>Encuestas</span>
          </button>
          
          {/* Administración */}
          <div className="mt-2 px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
            Administración
          </div>
          
          <button
            onClick={() => handleSectionChange('usuarios')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === 'usuarios' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <UserCheck className="h-5 w-5 mr-2" />
            <span>Usuarios</span>
          </button>
          
          <button
            onClick={() => handleSectionChange('configuracion')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === 'configuracion' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Settings className="h-5 w-5 mr-2" />
            <span>Configuración</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {renderSection()}
      </div>
    </div>
  );
};

export default MenuPrincipal;
