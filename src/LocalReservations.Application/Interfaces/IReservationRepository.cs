using LocalReservations.Domain.Entities;

namespace LocalReservations.Application.Interfaces;

public interface IReservationRepository : IRepository<Reservation>
{
    Task<IEnumerable<Reservation>> GetByUserAsync(Guid userId);
    Task<(IEnumerable<Reservation> Items, int TotalCount)> GetByUserPaginatedAsync(Guid userId, int page, int pageSize);
    Task<IEnumerable<Reservation>> GetByBusinessAsync(Guid businessId);
    Task<IEnumerable<Reservation>> GetByBusinessAndDateAsync(Guid businessId, DateTime date);
    Task<bool> HasConflictAsync(Guid businessId, DateTime date, TimeSpan startTime, TimeSpan endTime, Guid? excludeId = null);
    Task<IEnumerable<Reservation>> GetAllByOwnerAsync(Guid ownerId);
    Task<(IEnumerable<Reservation> Items, int TotalCount)> GetAllByOwnerPaginatedAsync(Guid ownerId, int page, int pageSize);
    Task<IEnumerable<Reservation>> GetForRemindersAsync(DateTime fromDate, DateTime toDate);
    Task<Reservation?> GetByIdWithDetailsAsync(Guid id);
    Task UpdateAsync(Reservation reservation);
}