namespace LocalReservations.Domain.Entities;

public enum UserRole
{
    Client,
    Admin
}

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Client;
    public string Phone { get; set; } = string.Empty;

    public ICollection<Business> OwnedBusinesses { get; set; } = new List<Business>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}