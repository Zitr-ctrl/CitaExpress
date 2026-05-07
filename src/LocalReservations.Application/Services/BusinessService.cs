using LocalReservations.Application.DTOs;
using LocalReservations.Application.Interfaces;
using LocalReservations.Domain.Entities;
using Microsoft.Extensions.Caching.Memory;

namespace LocalReservations.Application.Services;

public class BusinessService : IBusinessService
{
    private readonly IBusinessRepository _repository;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "businesses:all";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    public BusinessService(IBusinessRepository repository, IMemoryCache cache)
    {
        _repository = repository;
        _cache = cache;
    }

    public async Task<BusinessDto> CreateAsync(CreateBusinessRequest request, Guid ownerId)
    {
        var business = new Business
        {
            Name = request.Name,
            Description = request.Description,
            Address = request.Address,
            Phone = request.Phone,
            OpenTime = TimeSpan.Parse(request.OpenTime),
            CloseTime = TimeSpan.Parse(request.CloseTime),
            SlotDurationMinutes = request.SlotDurationMinutes,
            OwnerId = ownerId
        };

        var created = await _repository.AddAsync(business);
        _cache.Remove(CacheKey);
        return MapToDto(created);
    }

    public async Task<BusinessDto?> GetByIdAsync(Guid id)
    {
        var cacheKey = $"businesses:{id}";
        if (_cache.TryGetValue(cacheKey, out BusinessDto? cached))
            return cached;

        var business = await _repository.GetByIdAsync(id);
        var dto = business == null ? null : MapToDto(business);
        if (dto != null)
            _cache.Set(cacheKey, dto, CacheDuration);
        return dto;
    }

    public async Task<IEnumerable<BusinessDto>> GetAllAsync()
    {
        if (_cache.TryGetValue(CacheKey, out IEnumerable<BusinessDto>? cached))
            return cached!;

        var businesses = await _repository.GetAllAsync();
        var dtos = businesses.Select(MapToDto).ToList();
        _cache.Set(CacheKey, dtos, CacheDuration);
        return dtos;
    }

    public async Task<PagedResult<BusinessDto>> GetAllPaginatedAsync(int page, int pageSize)
    {
        var cacheKey = $"{CacheKey}:paginated:{page}:{pageSize}";
        if (_cache.TryGetValue(cacheKey, out PagedResult<BusinessDto>? cached))
            return cached!;

        var (items, totalCount) = await _repository.GetAllPaginatedAsync(page, pageSize);
        var result = new PagedResult<BusinessDto>
        {
            Items = items.Select(MapToDto),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
        _cache.Set(cacheKey, result, CacheDuration);
        return result;
    }

    public async Task<IEnumerable<BusinessDto>> GetByOwnerAsync(Guid ownerId)
    {
        var businesses = await _repository.GetByOwnerAsync(ownerId);
        return businesses.Select(MapToDto);
    }

    public async Task<BusinessDto> UpdateAsync(Guid id, UpdateBusinessRequest request, Guid ownerId)
    {
        var business = await _repository.GetByIdAsync(id);
        if (business == null)
            throw new InvalidOperationException("Business not found");
        if (business.OwnerId != ownerId)
            throw new UnauthorizedAccessException("Not authorized");

        if (!string.IsNullOrEmpty(request.Name)) business.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Description)) business.Description = request.Description;
        if (!string.IsNullOrEmpty(request.Address)) business.Address = request.Address;
        if (!string.IsNullOrEmpty(request.Phone)) business.Phone = request.Phone;
        if (!string.IsNullOrEmpty(request.OpenTime)) business.OpenTime = TimeSpan.Parse(request.OpenTime);
        if (!string.IsNullOrEmpty(request.CloseTime)) business.CloseTime = TimeSpan.Parse(request.CloseTime);
        if (request.SlotDurationMinutes > 0) business.SlotDurationMinutes = request.SlotDurationMinutes;
        business.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(business);
        _cache.Remove(CacheKey);
        _cache.Remove($"businesses:{id}");
        return MapToDto(business);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid ownerId)
    {
        var business = await _repository.GetByIdAsync(id);
        if (business == null) return false;
        if (business.OwnerId != ownerId)
            throw new UnauthorizedAccessException("Not authorized");

        await _repository.DeleteAsync(id);
        _cache.Remove(CacheKey);
        _cache.Remove($"businesses:{id}");
        return true;
    }

    private static BusinessDto MapToDto(Business business)
    {
        return new BusinessDto
        {
            Id = business.Id,
            Name = business.Name,
            Description = business.Description,
            Address = business.Address,
            Phone = business.Phone,
            OpenTime = business.OpenTime.ToString(@"hh\:mm"),
            CloseTime = business.CloseTime.ToString(@"hh\:mm"),
            SlotDurationMinutes = business.SlotDurationMinutes,
            OwnerId = business.OwnerId,
            CreatedAt = business.CreatedAt
        };
    }
}