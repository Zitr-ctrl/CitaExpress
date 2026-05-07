using LocalReservations.Application.DTOs;
using LocalReservations.Application.Interfaces;
using LocalReservations.Domain.Entities;
using LocalReservations.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalReservations.Infrastructure.Repositories;

public class NotificationLogRepository : INotificationLogRepository
{
    private readonly AppDbContext _context;

    public NotificationLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationLog> AddAsync(NotificationLog log)
    {
        _context.NotificationLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<IEnumerable<NotificationLog>> GetByReservationIdAsync(Guid reservationId)
    {
        return await _context.NotificationLogs
            .Where(n => n.ReservationId == reservationId)
            .OrderByDescending(n => n.SentAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<NotificationLog>> GetByFilterAsync(NotificationLogFilterDto filter)
    {
        var query = _context.NotificationLogs
            .Include(n => n.Reservation)
            .ThenInclude(r => r.Business)
            .AsQueryable();

        if (filter.ReservationId.HasValue)
            query = query.Where(n => n.ReservationId == filter.ReservationId.Value);

        if (filter.BusinessId.HasValue)
            query = query.Where(n => n.Reservation.BusinessId == filter.BusinessId.Value);

        if (filter.FromDate.HasValue)
            query = query.Where(n => n.SentAt >= filter.FromDate.Value);

        if (filter.ToDate.HasValue)
            query = query.Where(n => n.SentAt <= filter.ToDate.Value);

        if (filter.Success.HasValue)
            query = query.Where(n => n.Success == filter.Success.Value);

        return await query
            .OrderByDescending(n => n.SentAt)
            .ToListAsync();
    }
}
