using LocalReservations.Domain.Entities;

namespace LocalReservations.Application.DTOs;

public class NotificationLogDto
{
    public Guid Id { get; set; }
    public Guid ReservationId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string MessageContent { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}

public class NotificationLogFilterDto
{
    public Guid? ReservationId { get; set; }
    public Guid? BusinessId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public bool? Success { get; set; }
}
