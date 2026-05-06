using LocalReservations.Application.Interfaces;
using LocalReservations.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace LocalReservations.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IBusinessService, BusinessService>();
        services.AddScoped<IServiceService, ServiceService>();
        services.AddScoped<IReservationService, ReservationService>();

        return services;
    }
}