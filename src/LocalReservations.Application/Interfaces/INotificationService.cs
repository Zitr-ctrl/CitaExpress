using LocalReservations.Application.DTOs;
using LocalReservations.Domain.Entities;

namespace LocalReservations.Application.Interfaces;

public interface INotificationService
{
    Task SendReservationCreatedAsync(Guid reservationId);
    Task SendDayReminderAsync(Guid reservationId);
}
