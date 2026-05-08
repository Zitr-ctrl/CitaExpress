using LocalReservations.Application.Interfaces;
using LocalReservations.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LocalReservations.BackgroundServices;

public class ReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReminderBackgroundService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(15);

    public ReminderBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<ReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Reminder Background Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing reminders");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task ProcessRemindersAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var reservationRepository = scope.ServiceProvider.GetRequiredService<IReservationRepository>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var now = DateTime.UtcNow;
        var twoHoursFromNow = now.AddHours(2);

        var reservations = await reservationRepository.GetForRemindersAsync(now.Date, twoHoursFromNow.Date);

        foreach (var reservation in reservations)
        {
            var appointmentTime = reservation.ReservationDate.Date.Add(reservation.StartTime);
            var timeUntilAppointment = appointmentTime - now;

            if (timeUntilAppointment <= TimeSpan.FromHours(2) && timeUntilAppointment > TimeSpan.FromMinutes(0))
            {
                _logger.LogInformation(
                    "Sending reminder for reservation {ReservationId} at {AppointmentTime}",
                    reservation.Id, appointmentTime);

                await notificationService.SendDayReminderAsync(reservation.Id);
            }
        }
    }
}
