using LocalReservations.Domain.Entities;

namespace LocalReservations.Application.Interfaces;

public interface IBusinessRepository : IRepository<Business>
{
    Task<IEnumerable<Business>> GetByOwnerAsync(Guid ownerId);
}