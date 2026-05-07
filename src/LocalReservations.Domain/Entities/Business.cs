namespace LocalReservations.Domain.Entities;

public class Business : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public TimeSpan OpenTime { get; set; }
    public TimeSpan CloseTime { get; set; }
    public int SlotDurationMinutes { get; set; } = 30;
    public bool WhatsAppNotificationsEnabled { get; set; } = true;

    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public ICollection<Service> Services { get; set; } = new List<Service>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}