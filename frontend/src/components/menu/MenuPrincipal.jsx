import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "../theme/ThemeToggle";
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
  Package,
  LogOut,
} from "lucide-react";

// Importar componentes de dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Importar directamente nuestros componentes
import PersonalListing from "../personal/PersonalListing";
import AuditoriasList from "../auditorias/AuditoriasList";
import NormasList from "../normas/NormasList";
import DocumentosList from "../documentos/DocumentosList";
import SectionPlaceholder from "../common/SectionPlaceholder";
import UsuariosListing from "../usuarios/UsuariosListing";
import ProcesosListing from "../procesos/ProcesosListing";
import ObjetivosListing from "../procesos/ObjetivosListing";
import IndicadoresListing from "../procesos/IndicadoresListing";
import MedicionesListing from "../procesos/MedicionesListing";
import DepartamentosListing from "../rrhh/DepartamentosListing";
import PuestosListing from "../rrhh/PuestosListing";
import CapacitacionesListing from "../rrhh/CapacitacionesListing";
import EvaluacionesListing from "../rrhh/EvaluacionesListing";
import TicketsListing from "../tickets/TicketsListing";
import EncuestasListing from "../encuestas/EncuestasListing";
import MejorasListing from "../mejoras/MejorasListing";
import NoticiasListing from "../noticias/NoticiasListing";
import ProductosListing from "../productos/ProductosListing";
import UserHeader from "../auth/UserHeader";
import DashboardCentral from "../dashboard/DashboardCentral";
import CalendarioEventos from "../calendario/CalendarioEventos";

const MenuPrincipal = ({ onLogout }) => {
  const { isDark } = useTheme();
  const [selectedSection, setSelectedSection] = useState("noticias");
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSectionChange = (id) => {
    setSelectedSection(id);
  };

  const renderSection = () => {
    if (!selectedSection) {
      return (
        <div className="flex items-center justify-center h-full">
          <h2 className="text-xl font-semibold text-gray-700">
            Seleccione una opción del menú
          </h2>
        </div>
      );
    }

    // Renderizar componentes directamente
    switch (selectedSection) {
      case "noticias":
        return <NoticiasListing />;
      case "tablero":
        return <DashboardCentral />;
      case "personal":
        return <PersonalListing />;
      case "auditorias":
        return <AuditoriasList />;
      case "normas":
        return <NormasList />;
      case "documentos":
        return <DocumentosList />;
      case "usuarios":
        return <UsuariosListing />;
      case "procesos":
        return <ProcesosListing />;
      case "objetivos":
        return <ObjetivosListing />;
      case "indicadores":
        return <IndicadoresListing />;
      case "mediciones":
        return <MedicionesListing />;
      case "departamentos":
        return <DepartamentosListing />;
      case "puestos":
        return <PuestosListing />;
      case "capacitaciones":
        return <CapacitacionesListing />;
      case "evaluaciones":
        return <EvaluacionesListing />;
      case "tickets":
        return <TicketsListing />;
      case "encuestas":
        return <EncuestasListing />;
      case "mejoras":
        return <MejorasListing />;
      case "productos":
        return <ProductosListing />;
      case "calendario":
        return <CalendarioEventos />;
      default:
        return <SectionPlaceholder sectionName={selectedSection} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* UserHeader arriba a la derecha */}
      <UserHeader
        user={currentUser}
        onLogout={async () => {
          await logout();
          navigate("/login");
          if (onLogout) onLogout();
        }}
      />
      {/* Sidebar - Menú lateral */}
      <div className={`w-64 ${isDark ? 'bg-gray-800' : 'bg-green-800'} text-white`}>
        <div className={`p-4 ${isDark ? 'bg-gray-900' : 'bg-green-900'} flex items-center space-x-3`}>
          <div className={`rounded-full ${isDark ? 'bg-gray-100 text-gray-900' : 'bg-white text-green-800'} w-10 h-10 flex items-center justify-center font-bold`}>
            SGC
          </div>
          <div className="flex-1">
            <div className="font-bold">Los Señores del Agro</div>
            <div className="text-xs opacity-80">Sistema de Gestión de Calidad</div>
          </div>
        </div>
        
        {/* Botón de cambio de tema */}
        <div className="flex justify-center my-3">
          <ThemeToggle />
        </div>

        <div className="mt-4">
          {/* Opciones de menú individuales */}
          <button
            onClick={() => handleSectionChange("noticias")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "noticias"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Bell className="h-5 w-5 mr-2" />
            <span>Noticias</span>
          </button>

          <button
            onClick={() => handleSectionChange("tablero")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "tablero"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <BarChart2 className="h-5 w-5 mr-2" />
            <span>Tablero Central</span>
          </button>

          <button
            onClick={() => handleSectionChange("calendario")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "calendario"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Calendar className="h-5 w-5 mr-2" />
            <span>Calendario</span>
          </button>

          {/* Botón de Mejoras independiente */}
          <button
            onClick={() => handleSectionChange("mejoras")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "mejoras"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <ArrowUpCircle className="h-5 w-5 mr-2" />
            <span>Mejoras</span>
          </button>

          {/* Botón de Auditorías independiente */}
          <button
            onClick={() => handleSectionChange("auditorias")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "auditorias"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <ClipboardList className="h-5 w-5 mr-2" />
            <span>Auditorías</span>
          </button>

          {/* Recursos Humanos */}
          <div className="mt-2 px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
            Recursos Humanos
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center w-full px-4 py-2 text-left ${
                  [
                    "personal",
                    "departamentos",
                    "puestos",
                    "capacitaciones",
                    "evaluaciones",
                  ].includes(selectedSection)
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Users className="h-5 w-5 mr-2" />
                <span>Recursos Humanos</span>
                <ChevronDown className="ml-auto h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className={`min-w-[220px] ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
            >
              <DropdownMenuItem
                onClick={() => handleSectionChange("personal")}
                className={isDark ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-100 focus:bg-gray-100'}
              >
                <Users className="h-5 w-5 mr-3" />
                <span>Personal</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSectionChange("departamentos")}
                className={isDark ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-100 focus:bg-gray-100'}
              >
                <Building2 className="h-5 w-5 mr-3" />
                <span>Departamentos</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSectionChange("puestos")}
                className={isDark ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-100 focus:bg-gray-100'}
              >
                <Briefcase className="h-5 w-5 mr-3" />
                <span>Puestos</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSectionChange("capacitaciones")}
                className={isDark ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-100 focus:bg-gray-100'}
              >
                <GraduationCap className="h-5 w-5 mr-3" />
                <span>Capacitaciones</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSectionChange("evaluaciones")}
                className={isDark ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-100 focus:bg-gray-100'}
              >
                <ClipboardCheck className="h-5 w-5 mr-3" />
                <span>Evaluaciones</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Procesos - Ahora con dropdown */}
          <div className="mt-2 px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
            Sistema de Gestión
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center w-full px-4 py-2 text-left ${
                  [
                    "procesos",
                    "objetivos",
                    "indicadores",
                    "mediciones",
                    "mejoras",
                  ].includes(selectedSection)
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Activity className="h-5 w-5 mr-2" />
                <span>Procesos</span>
                <ChevronDown className="ml-auto h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className={`min-w-[220px] ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
            >
              <DropdownMenuItem 
                onClick={() => handleSectionChange("procesos")}
                className={isDark ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-100 focus:bg-gray-100'}
              >
                <Activity className="h-5 w-5 mr-3" />
                <span>Procesos</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSectionChange("objetivos")}
                className={isDark ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-100 focus:bg-gray-100'}
              >
                <Target className="h-5 w-5 mr-3" />
                <span>Objetivos</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSectionChange("indicadores")}
                className={isDark ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-100 focus:bg-gray-100'}
              >
                <LineChart className="h-5 w-5 mr-3" />
                <span>Indicadores</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSectionChange("mediciones")}
                className={isDark ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-100 focus:bg-gray-100'}
              >
                <BarChart2 className="h-5 w-5 mr-3" />
                <span>Mediciones</span>
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => handleSectionChange("documentos")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "documentos"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <FileText className="h-5 w-5 mr-2" />
            <span>Documentos</span>
          </button>

          <button
            onClick={() => handleSectionChange("normas")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "normas"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            <span>Puntos de Norma</span>
          </button>

          <button
            onClick={() => handleSectionChange("calendario")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "calendario"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Calendar className="h-5 w-5 mr-2" />
            <span>Calendario</span>
          </button>

          {/* Planificación y Desarrollo de Productos */}
          <div className="mt-2 px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
            Planificación y Desarrollo de Productos
          </div>

          <button
            onClick={() => handleSectionChange("productos")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "productos"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
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
            onClick={() => handleSectionChange("tickets")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "tickets"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            <span>Tickets</span>
          </button>

          <button
            onClick={() => handleSectionChange("encuestas")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "encuestas"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
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
            onClick={() => handleSectionChange("usuarios")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "usuarios"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <UserCheck className="h-5 w-5 mr-2" />
            <span>Usuarios</span>
          </button>

          <button
            onClick={() => handleSectionChange("configuracion")}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedSection === "configuracion"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Settings className="h-5 w-5 mr-2" />
            <span>Configuración</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 overflow-auto ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {renderSection()}
      </div>
    </div>
  );
};

export default MenuPrincipal;
