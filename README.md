# CitaExpress

![.NET](https://img.shields.io/badge/.NET-8.0-purple?style=flat-square)
![React](https://img.shields.io/badge/React-19.2.5-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.4-38B2AC?style=flat-square&logo=tailwind-css)

Sistema de gestión de reservas para negocios locales (clínicas, salones, consultorías, talleres). Permite a clientes descubrir negocios, explorar sus servicios y reservar citas. Los administradores gestionan usuarios y supervisan el sistema.

---

## Características

- **Autenticación JWT** - Registro e inicio de sesión con tokens seguros (BCrypt para passwords)
- **Gestión de Negocios** - Administradores crean, editan y eliminan negocios
- **Gestión de Servicios** - Cada negocio ofrece servicios con precio y duración
- **Sistema de Reservas** - Clientes reservan horarios disponibles con validación
- **Panel de Administración** - Dashboard completo para admins (usuarios, reservas, servicios)
- **Búsqueda Global** - Filtro de búsqueda en todas las tablas (negocios, reservas, servicios, usuarios)
- **Paginación Server-Side** - Resultados paginados con cache en backend (5min negocios/servicios, 1min slots)
- **Validación de Formularios** - Zod + React Hook Form para validación robusta
- **Notificaciones Toast** - Feedback visual para acciones exitosas y errores
- **Tema Oscuro/Light** - Toggle manual para cambiar entre modos
- **API Documentada** - Swagger disponible en `/swagger`
- **Rate Limiting** - Protección contra ataques de fuerza bruta (5/min login, 3/5min registro)

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
| BCrypt | 6.0.0 | Hashing de contraseñas |
| FluentValidation | 12.1.1 | Validación de entradas |
| IMemoryCache | 8.0.1 | Cache en memoria |
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
| TanStack Table | latest | Tablas con ordenamiento y búsqueda |
| React Hook Form | latest | Formularios controlados |
| Zod | latest | Validación de esquemas |
| React Hot Toast | latest | Notificaciones |
| Lucide React | latest | Iconos |

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
    │   ├── components/
    │   │   └── ui/                      # Componentes UI (DataTable, SearchInput, FormInput, etc.)
    │   ├── context/                     # Auth y Theme providers
    │   ├── pages/                       # Vistas de la aplicación
    │   ├── schemas/                     # Esquemas Zod de validación
    │   ├── api.ts                       # Servicio Axios
    │   ├── types.ts                     # Interfaces TypeScript
    │   └── main.tsx                     # Entry point
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

## Seguridad

- **JWT**: Key configurada via variable de entorno (`JWT_KEY`), mínimo 32 caracteres
- **Passwords**: BCrypt para hashing seguro (no almacenar en texto plano)
- **Rate Limiting**: 5 intentos/min en login, 3 intentos/5min en registro
- **CORS**: Restringido a localhost en desarrollo
- **Validación**: FluentValidation en backend, Zod en frontend

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

# Configurar variable de entorno (Windows)
$env:JWT_KEY="your-secure-key-at-least-32-characters-long"

# Restaurar dependencias
dotnet restore

# Ejecutar (disponible en http://localhost:5054)
dotnet run
```

> La base de datos SQLite se crea automáticamente en la primera ejecución.
> IMPORTANTE: En producción, la variable `JWT_KEY` es obligatoria. Sin ella, el servidor no arrancará.

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