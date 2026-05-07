using LocalReservations.Application.DTOs;
using LocalReservations.Domain.Entities;

namespace LocalReservations.Application.Interfaces;

public interface INotificationLogRepository
{
    Task<NotificationLog> AddAsync(NotificationLog log);
    Task<IEnumerable<NotificationLog>> GetByReservationIdAsync(Guid reservationId);
    Task<IEnumerable<NotificationLog>> GetByFilterAsync(NotificationLogFilterDto filter);
}
