# ISOflow - Sistema de Gestión de Calidad

## Actualizaciones - 10 de Mayo de 2025

### Implementación del Sistema de Autenticación
Se ha implementado un sistema completo de autenticación para la plataforma ISOflow, lo que permite controlar el acceso a la aplicación y proteger la información sensible. Las características principales incluyen:

#### Base de Datos
- Integración directa con **Turso DB** sin necesidad de backend tradicional
- Creación de tablas para almacenamiento de usuarios y registro de actividad:
  - `usuarios`: Almacena información de usuarios (id, nombre, email, password_hash, role)
  - `actividad_usuarios`: Registra todas las actividades de los usuarios (login, logout, etc.)

#### Autenticación
- Implementación de servicio de autenticación con métodos para:
  - Login
  - Registro de nuevos usuarios
  - Cierre de sesión
  - Actualización de perfil
  - Registro de actividad
- Sistema de almacenamiento seguro de sesión en localStorage

#### Protección de Rutas
- Implementación de componente de rutas protegidas que evita el acceso a usuarios no autenticados
- Sistema de control de acceso basado en roles (admin, supervisor, user)
- Pantalla de acceso denegado para usuarios sin permisos suficientes

#### Usuarios Predefinidos
Se han configurado tres usuarios de prueba para la aplicación:

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Administrador | admin@isoflow.com | admin123 | admin |
| Juan Pérez | juan@isoflow.com | isoflow123 | user |
| María Gómez | maria@isoflow.com | isoflow123 | supervisor |

### Mejoras en la Interfaz de Usuario
- **Panel de Noticias**: Se eliminó la imagen del centro del panel de noticias para una interfaz más limpia y enfocada en el contenido
- **Menú Principal**: Se agregó información del usuario actualmente logueado y botón de cierre de sesión
- **Diseño Responsivo**: Mejoras en la adaptabilidad y experiencia de usuario en dispositivos móviles

### Arquitectura del Sistema
- Implementación de contexto de React para gestión global del estado de autenticación 
- Uso de React Router para la navegación y protección de rutas
- Carga diferida (lazy loading) de componentes para mejorar el rendimiento

### Scripts de Utilidad
- `create-auth-tables.js`: Script para crear las tablas necesarias en la base de datos Turso
- `add-sample-users.js`: Script para agregar usuarios de ejemplo al sistema

## Instrucciones para Desarrolladores

### Requisitos Previos
- Node.js v18+
- npm v9+

### Instalación
```bash
# Instalar dependencias del proyecto
cd frontend
npm install

# Instalar dependencias adicionales (jwt-decode, react-router-dom)
npm install jwt-decode react-router-dom --save
```

### Ejecutar en Desarrollo
```bash
cd frontend
npm run dev
```

### Compilar para Producción
```bash
cd frontend
npm run build
```
La aplicación compilada estará en la carpeta `dist`, lista para ser desplegada en Hostinger o cualquier otro servicio de hosting.

## Próximas Mejoras
- Implementación de recuperación de contraseña
- Mejora en la gestión de permisos granulares
- Integración con sistema de notificaciones
- Registro y monitoreo de actividad avanzado
