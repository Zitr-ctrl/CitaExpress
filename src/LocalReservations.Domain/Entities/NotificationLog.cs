namespace LocalReservations.Domain.Entities;

public enum NotificationType
{
    Created,
    DayReminder
}

public class NotificationLog : BaseEntity
{
    public Guid ReservationId { get; set; }
    public Reservation Reservation { get; set; } = null!;

    public NotificationType Type { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string MessageContent { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}
