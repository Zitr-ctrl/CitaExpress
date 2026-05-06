using LocalReservations.Application.Interfaces;
using LocalReservations.Infrastructure.Persistence;
using LocalReservations.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace LocalReservations.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBusinessRepository, BusinessRepository>();
        services.AddScoped<IServiceRepository, ServiceRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();

        return services;
    }
}