namespace LocalReservations.Domain.Entities;

public enum ReservationStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed
}

public class Reservation : BaseEntity
{
    public DateTime ReservationDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public string Notes { get; set; } = string.Empty;
    public bool ReminderSent { get; set; } = false;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid BusinessId { get; set; }
    public Business Business { get; set; } = null!;

    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
}