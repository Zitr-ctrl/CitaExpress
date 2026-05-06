namespace LocalReservations.Application.DTOs;

public class ReservationDto
{
    public Guid Id { get; set; }
    public DateTime ReservationDate { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserPhone { get; set; } = string.Empty;
    public Guid BusinessId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public Guid ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateReservationRequest
{
    public DateTime ReservationDate { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public Guid BusinessId { get; set; }
    public Guid ServiceId { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class AvailableSlotDto
{
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
}