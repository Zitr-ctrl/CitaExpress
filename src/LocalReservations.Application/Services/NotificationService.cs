using LocalReservations.Application.Interfaces;
using LocalReservations.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace LocalReservations.Application.Services;

public class NotificationService : INotificationService
{
    private readonly IWhatsAppService _whatsAppService;
    private readonly INotificationLogRepository _notificationLogRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IWhatsAppService whatsAppService,
        INotificationLogRepository notificationLogRepository,
        IReservationRepository reservationRepository,
        ILogger<NotificationService> logger)
    {
        _whatsAppService = whatsAppService;
        _notificationLogRepository = notificationLogRepository;
        _reservationRepository = reservationRepository;
        _logger = logger;
    }

    public async Task SendReservationCreatedAsync(Guid reservationId)
    {
        await SendNotificationAsync(reservationId, NotificationType.Created, GetCreatedMessage);
    }

    public async Task SendDayReminderAsync(Guid reservationId)
    {
        await SendNotificationAsync(reservationId, NotificationType.DayReminder, GetDayReminderMessage);
    }

    private async Task SendNotificationAsync(
        Guid reservationId,
        NotificationType type,
        Func<Reservation, string> messageBuilder)
    {
        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            ReservationId = reservationId,
            Type = type,
            SentAt = DateTime.UtcNow
        };

        try
        {
            var reservation = await _reservationRepository.GetByIdWithDetailsAsync(reservationId);
            if (reservation == null)
            {
                log.Success = false;
                log.ErrorMessage = "Reservation not found";
                await _notificationLogRepository.AddAsync(log);
                return;
            }

            if (!reservation.Business.WhatsAppNotificationsEnabled)
            {
                log.Success = false;
                log.ErrorMessage = "Notifications disabled for this business";
                log.PhoneNumber = reservation.User?.Phone ?? string.Empty;
                log.MessageContent = messageBuilder(reservation);
                await _notificationLogRepository.AddAsync(log);
                return;
            }

            var userPhone = reservation.User?.Phone;
            if (string.IsNullOrEmpty(userPhone))
            {
                log.Success = false;
                log.ErrorMessage = "User has no phone number";
                log.PhoneNumber = string.Empty;
                log.MessageContent = messageBuilder(reservation);
                await _notificationLogRepository.AddAsync(log);
                return;
            }

            log.PhoneNumber = userPhone;
            log.MessageContent = messageBuilder(reservation);

            var sent = await _whatsAppService.SendMessageAsync(userPhone, log.MessageContent);

            log.Success = sent;
            if (!sent)
                log.ErrorMessage = "Failed to send WhatsApp message";

            await _notificationLogRepository.AddAsync(log);

            if (sent && type == NotificationType.DayReminder)
            {
                reservation.ReminderSent = true;
                await _reservationRepository.UpdateAsync(reservation);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification {Type} for reservation {ReservationId}", type, reservationId);
            log.Success = false;
            log.ErrorMessage = ex.Message;
            await _notificationLogRepository.AddAsync(log);
        }
    }

    private static string GetCreatedMessage(Reservation r)
    {
        var dateStr = r.ReservationDate.ToString("dd/MM/yyyy");
        var timeStr = DateTime.Today.Add(r.StartTime).ToString("h:mm tt");

        return $@"¡Tu cita ha sido confirmada! 📅

🏪 Negocio: {r.Business?.Name ?? "N/A"}
🛍️ Servicio: {r.Service?.Name ?? "N/A"}
📅 Fecha: {dateStr}
🕐 Hora: {timeStr}

Te esperamos. Si necesitas cancelar, hazlo con anticipación.";
    }

    private static string GetDayReminderMessage(Reservation r)
    {
        var dateStr = r.ReservationDate.ToString("dd/MM/yyyy");
        var timeStr = DateTime.Today.Add(r.StartTime).ToString("h:mm tt");

        return $@"¡Recordatorio! Tu cita es en 2 horas ⏰

🏪 {r.Business?.Name ?? "N/A"}
🛍️ {r.Service?.Name ?? "N/A"}
📅 {dateStr}
🕐 {timeStr}

¡Te esperamos!";
    }
}
