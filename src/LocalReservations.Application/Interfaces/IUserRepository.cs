using LocalReservations.Domain.Entities;

namespace LocalReservations.Application.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    new Task<bool> DeleteAsync(Guid id);
}