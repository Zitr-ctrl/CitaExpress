using System.Security.Claims;
using System.Text;
using FluentValidation;
using LocalReservations.Application.DTOs;
using LocalReservations.Application.Interfaces;
using LocalReservations.Application.Services;
using LocalReservations.Application.Validators;
using LocalReservations.BackgroundServices;
using LocalReservations.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace LocalReservations.API;

public static class ServiceConfiguration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBusinessRepository, BusinessRepository>();
        services.AddScoped<IServiceRepository, ServiceRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();
        services.AddScoped<INotificationLogRepository, NotificationLogRepository>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IBusinessService, BusinessService>();
        services.AddScoped<IServiceService, ServiceService>();
        services.AddScoped<IReservationService, ReservationService>();
        services.AddScoped<INotificationService, NotificationService>();

        services.AddHttpClient<IWhatsAppService, WhatsAppService>();

        services.AddHostedService<ReminderBackgroundService>();

        services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var key = Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };
        });

        return services;
    }

    public static IServiceCollection AddSwaggerConfiguration(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Local Reservations API",
                Version = "v1",
                Description = "API for managing reservations in local businesses"
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}