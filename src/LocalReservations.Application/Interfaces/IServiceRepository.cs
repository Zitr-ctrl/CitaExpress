using LocalReservations.Domain.Entities;

namespace LocalReservations.Application.Interfaces;

public interface IServiceRepository : IRepository<Service>
{
    Task<IEnumerable<Service>> GetByBusinessAsync(Guid businessId);
}