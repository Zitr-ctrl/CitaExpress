using LocalReservations.Application.Interfaces;
using LocalReservations.Domain.Entities;
using LocalReservations.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalReservations.Infrastructure.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly AppDbContext _context;

    public ReservationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Reservation?> GetByIdAsync(Guid id)
        => await _context.Reservations.FindAsync(id);

    public async Task<IEnumerable<Reservation>> GetAllAsync()
        => await _context.Reservations.ToListAsync();

    public async Task<(IEnumerable<Reservation> Items, int TotalCount)> GetAllPaginatedAsync(int page, int pageSize)
    {
        var totalCount = await _context.Reservations.CountAsync();
        var items = await _context.Reservations
            .Include(r => r.Business)
            .Include(r => r.Service)
            .OrderByDescending(r => r.ReservationDate)
            .ThenByDescending(r => r.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return (items, totalCount);
    }

    public async Task<Reservation> AddAsync(Reservation entity)
    {
        _context.Reservations.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(Reservation entity)
    {
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity == null) return false;
        _context.Reservations.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
        => await _context.Reservations.AnyAsync(r => r.Id == id);

    public async Task<IEnumerable<Reservation>> GetByUserAsync(Guid userId)
    {
        var reservations = await _context.Reservations
            .Include(r => r.Business)
            .Include(r => r.Service)
            .Where(r => r.UserId == userId)
            .ToListAsync();

        return reservations
            .OrderByDescending(r => r.ReservationDate)
            .ThenByDescending(r => r.StartTime);
    }

    public async Task<(IEnumerable<Reservation> Items, int TotalCount)> GetByUserPaginatedAsync(Guid userId, int page, int pageSize)
    {
        var query = _context.Reservations
            .Include(r => r.Business)
            .Include(r => r.Service)
            .Where(r => r.UserId == userId);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.ReservationDate)
            .ThenByDescending(r => r.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<IEnumerable<Reservation>> GetByBusinessAsync(Guid businessId)
    {
        var reservations = await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Service)
            .Where(r => r.BusinessId == businessId)
            .ToListAsync();

        return reservations
            .OrderByDescending(r => r.ReservationDate)
            .ThenByDescending(r => r.StartTime);
    }

    public async Task<IEnumerable<Reservation>> GetByBusinessAndDateAsync(Guid businessId, DateTime date)
        => await _context.Reservations
            .Where(r => r.BusinessId == businessId && r.ReservationDate.Date == date.Date)
            .ToListAsync();

    public async Task<bool> HasConflictAsync(Guid businessId, DateTime date, TimeSpan startTime, TimeSpan endTime, Guid? excludeId = null)
    {
        var reservations = await _context.Reservations
            .Where(r => r.BusinessId == businessId && r.ReservationDate.Date == date.Date)
            .ToListAsync();

        return reservations.Any(r =>
            r.Status != ReservationStatus.Cancelled &&
            r.Id != excludeId &&
            r.StartTime < endTime &&
            r.EndTime > startTime);
    }

    public async Task<IEnumerable<Reservation>> GetAllByOwnerAsync(Guid ownerId)
    {
        var businessIds = await _context.Businesses
            .Where(b => b.OwnerId == ownerId)
            .Select(b => b.Id)
            .ToListAsync();

        var reservations = await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Business)
            .Include(r => r.Service)
            .Where(r => businessIds.Contains(r.BusinessId))
            .ToListAsync();

        return reservations
            .OrderByDescending(r => r.ReservationDate)
            .ThenByDescending(r => r.StartTime);
    }

    public async Task<(IEnumerable<Reservation> Items, int TotalCount)> GetAllByOwnerPaginatedAsync(Guid ownerId, int page, int pageSize)
    {
        var businessIds = await _context.Businesses
            .Where(b => b.OwnerId == ownerId)
            .Select(b => b.Id)
            .ToListAsync();

        var query = _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Business)
            .Include(r => r.Service)
            .Where(r => businessIds.Contains(r.BusinessId));

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.ReservationDate)
            .ThenByDescending(r => r.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<IEnumerable<Reservation>> GetForRemindersAsync(DateTime fromDate, DateTime toDate)
    {
        return await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Business)
            .Include(r => r.Service)
            .Where(r =>
                r.Status == ReservationStatus.Confirmed &&
                !r.ReminderSent &&
                r.ReservationDate.Date >= fromDate.Date &&
                r.ReservationDate.Date <= toDate.Date)
            .ToListAsync();
    }

    public async Task<Reservation?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Business)
            .Include(r => r.Service)
            .FirstOrDefaultAsync(r => r.Id == id);
    }
}