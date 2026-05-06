using LocalReservations.Application.DTOs;

namespace LocalReservations.Application.Interfaces;

public interface IBusinessService
{
    Task<BusinessDto> CreateAsync(CreateBusinessRequest request, Guid ownerId);
    Task<BusinessDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<BusinessDto>> GetAllAsync();
    Task<IEnumerable<BusinessDto>> GetByOwnerAsync(Guid ownerId);
    Task<BusinessDto> UpdateAsync(Guid id, UpdateBusinessRequest request, Guid ownerId);
    Task<bool> DeleteAsync(Guid id, Guid ownerId);
}