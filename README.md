# CitaExpress

![.NET](https://img.shields.io/badge/.NET-8.0-purple?style=flat-square)
![React](https://img.shields.io/badge/React-19.2.5-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.4-38B2AC?style=flat-square&logo=tailwind-css)

Sistema de gestión de reservas para negocios locales (clínicas, salones, consultorías, talleres). Permite a clientes descubrir negocios, explorar sus servicios y reservar citas. Los administradores gestionan usuarios y supervisan el sistema.

---

## Características

- **Autenticación JWT** - Registro e inicio de sesión con tokens seguros
- **Gestión de Negocios** - Administradores crean, editan y eliminan negocios
- **Gestión de Servicios** - Cada negocio ofrece servicios con precio y duración
- **Sistema de Reservas** - Clientes reservan horarios disponibles con validación
- **Panel de Administración** - Dashboard completo para admins (usuarios, reservas, servicios)
- **Tema Oscuro/Light** - Toggle manual para cambiar entre modos
- **API Documentada** - Swagger disponible en `/swagger`

---

## Tecnologías

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| .NET | 8.0 | Runtime framework |
| ASP.NET Core | 8.0 | Web API framework |
| Entity Framework Core | 8.0.0 | ORM para acceso a datos |
| SQLite | - | Base de datos ligera |
| JWT Bearer | 8.0.0 | Autenticación por tokens |
| FluentValidation | 12.1.1 | Validación de entradas |
| Swashbuckle | 6.6.2 | Documentación Swagger |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.2.5 | Librería UI |
| TypeScript | ~6.0 | JavaScript tipado |
| Vite | 8.0.10 | Build tool y dev server |
| React Router | 7.15.0 | Enrutamiento cliente |
| Axios | 1.16.0 | Cliente HTTP |
| Tailwind CSS | 4.2.4 | Estilos utilitarios |

---

## Arquitectura

Proyecto basado en **Clean Architecture** con 4 capas:

```
LocalReservations/
├── src/
│   ├── LocalReservations.Domain/        # Entidades y reglas de negocio
│   ├── LocalReservations.Application/  # Lógica de negocio, DTOs, servicios
│   ├── LocalReservations.Infrastructure/ # Acceso a datos, repositorios
│   └── LocalReservations.API/          # Controladores, middleware, JWT
│
└── client/                              # Frontend React
    ├── src/
    │   ├── components/                  # Componentes reutilizables
    │   ├── context/                     # Auth y Theme providers
    │   ├── pages/                       # Vistas de la aplicación
    │   ├── api.ts                       # Servicio Axios
    │   └── types.ts                     # Interfaces TypeScript
    └── ...
```

### Relaciones entre Entidades

```
Usuario (1) ──────< (N) Negocio        # Propietario posee negocios
Usuario (1) ──────< (N) Reserva        # Cliente realiza reservas
Negocio (1) ──────< (N) Servicio       # Negocio ofrece servicios
Negocio (1) ──────< (N) Reserva        # Negocio recibe reservas
Servicio (1) ─────< (N) Reserva       # Servicio reservado
```

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Administrador** | admin@localreservations.com | Admin123! |
| **Cliente** | john@example.com | Client123! |

---

## Cómo Ejecutar

### Requisitos Previos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- npm o yarn

### 1. Backend (API)

```bash
# Navegar al directorio del API
cd src/LocalReservations.API

# Restaurar dependencias
dotnet restore

# Ejecutar (disponible en http://localhost:5054)
dotnet run
```

> La base de datos SQLite se crea automáticamente en la primera ejecución.

### 2. Frontend

```bash
# En otra terminal, navegar al cliente
cd client

# Instalar dependencias
npm install

# Ejecutar (disponible en http://localhost:5173)
npm run dev
```

### 3. Acceder a la Aplicación

1. Abrir **http://localhost:5173** en el navegador
2. Iniciar sesión con las credenciales de prueba
3. Para acceder al panel de admin, ir a **/admin**

### URLs Importantes

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5054 |
| Swagger (API Docs) | http://localhost:5054/swagger |

---

## Preview

![CitaExpress Preview](preview.png)

---

## Licencia

MIT