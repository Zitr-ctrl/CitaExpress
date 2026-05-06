namespace LocalReservations.Application.DTOs;

public class BusinessDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OpenTime { get; set; } = string.Empty;
    public string CloseTime { get; set; } = string.Empty;
    public int SlotDurationMinutes { get; set; }
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateBusinessRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OpenTime { get; set; } = "09:00";
    public string CloseTime { get; set; } = "18:00";
    public int SlotDurationMinutes { get; set; } = 30;
}

public class UpdateBusinessRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OpenTime { get; set; } = string.Empty;
    public string CloseTime { get; set; } = string.Empty;
    public int SlotDurationMinutes { get; set; }
}