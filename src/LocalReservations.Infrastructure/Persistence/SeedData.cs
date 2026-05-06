using LocalReservations.Application.Services;
using LocalReservations.Domain.Entities;

namespace LocalReservations.Infrastructure.Persistence;

public static class SeedData
{
    public static void Initialize(AppDbContext context)
    {
        if (context.Users.Any()) return;

        var adminUser = new User
        {
            Name = "Admin User",
            Email = "admin@localreservations.com",
            PasswordHash = AuthService.HashPassword("Admin123!"),
            Phone = "+1234567890",
            Role = UserRole.Admin
        };

        var clientUser = new User
        {
            Name = "John Client",
            Email = "john@example.com",
            PasswordHash = AuthService.HashPassword("Client123!"),
            Phone = "+1234567891",
            Role = UserRole.Client
        };

        context.Users.AddRange(adminUser, clientUser);
        context.SaveChanges();

        var barberShop = new Business
        {
            Name = "Elite Barbershop",
            Description = "Premium barber services with classic cuts and modern styles",
            Address = "123 Main Street, Downtown",
            Phone = "+1234567890",
            OpenTime = new TimeSpan(9, 0, 0),
            CloseTime = new TimeSpan(20, 0, 0),
            SlotDurationMinutes = 30,
            OwnerId = adminUser.Id
        };

        var dentalClinic = new Business
        {
            Name = "Smile Dental Clinic",
            Description = "Professional dental care for the whole family",
            Address = "456 Health Avenue, Medical District",
            Phone = "+1234567892",
            OpenTime = new TimeSpan(8, 0, 0),
            CloseTime = new TimeSpan(18, 0, 0),
            SlotDurationMinutes = 45,
            OwnerId = adminUser.Id
        };

        context.Businesses.AddRange(barberShop, dentalClinic);
        context.SaveChanges();

        var services = new List<Service>
        {
            new Service { Name = "Classic Haircut", Description = "Traditional men's haircut with styling", Price = 25.00m, DurationMinutes = 30, BusinessId = barberShop.Id },
            new Service { Name = "Beard Trim", Description = "Shape and style your beard", Price = 15.00m, DurationMinutes = 20, BusinessId = barberShop.Id },
            new Service { Name = "Haircut + Beard", Description = "Full service haircut and beard combo", Price = 35.00m, DurationMinutes = 45, BusinessId = barberShop.Id },
            new Service { Name = "Cleaning", Description = "Professional dental cleaning", Price = 80.00m, DurationMinutes = 45, BusinessId = dentalClinic.Id },
            new Service { Name = "Checkup", Description = "Routine dental examination", Price = 50.00m, DurationMinutes = 30, BusinessId = dentalClinic.Id }
        };

        context.Services.AddRange(services);
        context.SaveChanges();
    }
}