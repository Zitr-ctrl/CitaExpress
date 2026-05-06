using LocalReservations.Application.DTOs;

namespace LocalReservations.Application.Interfaces;

public interface IServiceService
{
    Task<ServiceDto> CreateAsync(Guid businessId, CreateServiceRequest request);
    Task<ServiceDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<ServiceDto>> GetByBusinessAsync(Guid businessId);
    Task<ServiceDto> UpdateAsync(Guid id, UpdateServiceRequest request);
    Task<bool> DeleteAsync(Guid id);
}