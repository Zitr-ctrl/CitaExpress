using LocalReservations.Application.DTOs;
using LocalReservations.Application.Interfaces;
using LocalReservations.Domain.Entities;
using Microsoft.Extensions.Caching.Memory;

namespace LocalReservations.Application.Services;

public class ServiceService : IServiceService
{
    private readonly IServiceRepository _repository;
    private readonly IBusinessRepository _businessRepository;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    public ServiceService(IServiceRepository repository, IBusinessRepository businessRepository, IMemoryCache cache)
    {
        _repository = repository;
        _businessRepository = businessRepository;
        _cache = cache;
    }

    public async Task<ServiceDto> CreateAsync(Guid businessId, CreateServiceRequest request)
    {
        var businessExists = await _businessRepository.ExistsAsync(businessId);
        if (!businessExists)
            throw new InvalidOperationException("Business not found");

        var service = new Service
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            DurationMinutes = request.DurationMinutes,
            BusinessId = businessId
        };

        var created = await _repository.AddAsync(service);
        _cache.Remove($"services:business:{businessId}");
        return MapToDto(created);
    }

    public async Task<ServiceDto?> GetByIdAsync(Guid id)
    {
        var cacheKey = $"services:{id}";
        if (_cache.TryGetValue(cacheKey, out ServiceDto? cached))
            return cached;

        var service = await _repository.GetByIdAsync(id);
        var dto = service == null ? null : MapToDto(service);
        if (dto != null)
            _cache.Set(cacheKey, dto, CacheDuration);
        return dto;
    }

    public async Task<IEnumerable<ServiceDto>> GetByBusinessAsync(Guid businessId)
    {
        var cacheKey = $"services:business:{businessId}";
        if (_cache.TryGetValue(cacheKey, out IEnumerable<ServiceDto>? cached))
            return cached!;

        var services = await _repository.GetByBusinessAsync(businessId);
        var dtos = services.Select(MapToDto).ToList();
        _cache.Set(cacheKey, dtos, CacheDuration);
        return dtos;
    }

    public async Task<ServiceDto> UpdateAsync(Guid id, UpdateServiceRequest request)
    {
        var service = await _repository.GetByIdAsync(id);
        if (service == null)
            throw new InvalidOperationException("Service not found");

        if (!string.IsNullOrEmpty(request.Name)) service.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Description)) service.Description = request.Description;
        if (request.Price > 0) service.Price = request.Price;
        if (request.DurationMinutes > 0) service.DurationMinutes = request.DurationMinutes;
        service.IsActive = request.IsActive;
        service.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(service);
        _cache.Remove($"services:{id}");
        _cache.Remove($"services:business:{service.BusinessId}");
        return MapToDto(service);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var service = await _repository.GetByIdAsync(id);
        if (service == null) return false;

        await _repository.DeleteAsync(id);
        _cache.Remove($"services:{id}");
        _cache.Remove($"services:business:{service.BusinessId}");
        return true;
    }

    private static ServiceDto MapToDto(Service service)
    {
        return new ServiceDto
        {
            Id = service.Id,
            Name = service.Name,
            Description = service.Description,
            Price = service.Price,
            DurationMinutes = service.DurationMinutes,
            IsActive = service.IsActive,
            BusinessId = service.BusinessId,
            CreatedAt = service.CreatedAt
        };
    }
}