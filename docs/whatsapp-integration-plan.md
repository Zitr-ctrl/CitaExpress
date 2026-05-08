# Plan de Integración: WhatsApp con Evolution API

## Resumen

Sistema de notificaciones WhatsApp para el sistema LocalReservations usando **Evolution API**, enviando:
1. **Mensaje al crear cita** - Confirmación inmediata
2. **Recordatorio 2 horas antes** - Automation mediante background service

---

## 1. Configuración de Evolution API

### Requisitos Previos
- Docker instalado
- WhatsApp escaneado en la instancia

### Instalación con Docker

```bash
# Crear directorio para Evolution API
mkdir -p evolution

# Crear archivo docker-compose.yml
cat > evolution/docker-compose.yml << 'EOF'
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution_api
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_API_KEY=your-secret-api-key
      - DEL_INSTANCE=false
      - WEBHOOK_GLOBAL_ENABLED=false
      - LOG_LEVEL=INFO
    volumes:
      - evolution_data:/evolution/instances

volumes:
  evolution_data:
    driver: local
EOF

# Iniciar Evolution API
cd evolution
docker-compose up -d

# Verificar que está corriendo
curl http://localhost:8080
```

### Conexión de WhatsApp

1. Abrir `http://localhost:8080/manager`
2. Crear instancia: `localreservations`
3. Escaneo QR con WhatsApp Business o Personal
4. Guardar API Key

---

## 2. Estructura del Proyecto Backend

```
src/
├── LocalReservations.Application/
│   ├── DTOs/
│   │   └── NotificationLogDto.cs
│   ├── Interfaces/
│   │   ├── IWhatsAppService.cs
│   │   └── INotificationService.cs
│   └── Services/
│       ├── WhatsAppService.cs
│       └── NotificationService.cs
├── LocalReservations.Domain/
│   └── Entities/
│       ├── NotificationLog.cs        (nuevo)
│       └── Reservation.cs           (modificado)
├── LocalReservations.Infrastructure/
│   ├── Persistence/
│   │   └── AppDbContext.cs           (modificado)
│   └── Repositories/
│       └── NotificationLogRepository.cs (nuevo)
├── LocalReservations.API/
│   └── Program.cs                    (modificado)
└── LocalReservations.BackgroundServices/
    └── ReminderBackgroundService.cs  (nuevo)
```

---

## 3. Formato de Teléfono

**Formato de almacenamiento:** `+593XXXXXXXXX` (Ecuador)
- Código país: `+593`
- 9 dígitos del número

**Validación:**
```
^\+593[0-9]{9}$
```

**Ejemplos válidos:**
- `+593987654321`
- `+593991234567`

---

## 4. Modelo de Datos

### Reservation (modificación)
```csharp
public class Reservation : BaseEntity
{
    // ... campos existentes ...
    public bool ReminderSent { get; set; } = false;
}
```

### Business (modificación)
```csharp
public class Business : BaseEntity
{
    // ... campos existentes ...
    public bool WhatsAppNotificationsEnabled { get; set; } = true;
}
```

### NotificationLog (nuevo)
```csharp
public class NotificationLog : BaseEntity
{
    public Guid ReservationId { get; set; }
    public string NotificationType { get; set; } // "CREATED" | "DAY_REMINDER"
    public string PhoneNumber { get; set; }
    public string MessageContent { get; set; }
    public DateTime SentAt { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}
```

---

## 5. Mensajes a Enviar

### Mensaje 1: Confirmación de Cita (al crear)
```
¡Tu cita ha sido confirmada! 📅

🏪 Negocio: {businessName}
🛍️ Servicio: {serviceName}
📅 Fecha: {fecha}
🕐 Hora: {hora}

Te esperamos. Si necesitas cancelar, hazlo con anticipación.
```

### Mensaje 2: Recordatorio (2 horas antes)
```
¡Recordatorio! Tu cita es en 2 horas ⏰

🏪 {businessName}
🛍️ {serviceName}
📅 {fecha}
🕐 {hora}

¡Te esperamos!
```

---

## 6. Flujo de Implementación

### Fase 1: Configuración Base
1. [x] Agregar configuración `EvolutionApi` a `appsettings.json`
2. [x] Crear `IWhatsAppService` interfaz
3. [x] Crear `WhatsAppService` implementación
4. [x] Agregar HttpClient configuration

### Fase 2: Modelo de Datos
5. [x] Crear entidad `NotificationLog`
6. [x] Agregar campo `ReminderSent` a `Reservation`
7. [x] Agregar campo `WhatsAppNotificationsEnabled` a `Business`
8. [ ] Crear migración EF Core (requiere ejecutar `dotnet ef migrations add`)
9. [x] Crear `NotificationLogRepository`

### Fase 3: Servicio de Notificaciones
10. [x] Crear `INotificationService` interfaz
11. [x] Crear `NotificationService` implementación
12. [x] Modificar `ReservationService.CreateAsync` para enviar mensaje 1
13. [x] Integrar con logs de notificación

### Fase 4: Background Service (Recordatorios)
14. [x] Crear `ReminderBackgroundService` (IHostedService)
15. [x] Lógica: buscar citas en 2 horas, enviar recordatorio, marcar `ReminderSent=true`
16. [x] Registrar en `Program.cs`

### Fase 5: Integración Admin
17. [x] Agregar endpoint toggle notificaciones por negocio
18. [x] Agregar endpoint para ver logs de notificaciones

---

## 7. Endpoints de API

### PUT /api/businesses/{id}/whatsapp-toggle
Activa/desactiva notificaciones WhatsApp para un negocio.

**Request:**
```json
{ "enabled": true }
```

### GET /api/notifications/logs?reservationId={id}
Obtiene logs de notificaciones de una reserva.

### GET /api/notifications/logs?businessId={id}
Obtiene todos los logs de un negocio.

---

## 8. Dependencias

### NuGet Packages requeridos
- `Microsoft.Extensions.Http` (ya incluido en ASP.NET Core)
- `Microsoft.Extensions.Hosting` (para BackgroundService)

### No se requieren packages adicionales - se usa HttpClient nativo.

---

## 9. Variables de Entorno

```bash
# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-secret-api-key
EVOLUTION_INSTANCE_NAME=localreservations
```

---

## 10. Testing

### Probar envío de mensaje manualmente
```bash
curl -X POST http://localhost:8080/message/sendText/localreservations \
  -H "Content-Type: application/json" \
  -H "apikey: your-secret-api-key" \
  -d '{
    "number": "+593987654321",
    "text": "Hola, esto es una prueba"
  }'
```

### Verificar logs de Evolution API
```bash
curl http://localhost:8080/instance/connectionState/localreservations \
  -H "apikey: your-secret-api-key"
```

---

## 11. Formato de Hora en Mensajes

El mensaje mostrará la hora en formato legible:
- **Original:** `TimeSpan` (ej: `14:00:00`)
- **Mostrado:** `2:00 PM`

---

## 12. Consideraciones

1. **Rate Limiting:** Evolution API puede tener límites; el servicio debe manejar errores 429
2. **Reintentos:** Implementar reintento automático si falla el envío (max 3 intentos)
3. **Formato de teléfono:** Validar en registro que el teléfono tenga formato `+593XXXXXXXXX`
4. **Instancia desconectada:** Si WhatsApp se desconecta, los mensajes se perderán - considerar cola
