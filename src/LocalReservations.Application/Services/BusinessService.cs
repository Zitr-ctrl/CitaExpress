using LocalReservations.Application.DTOs;
using LocalReservations.Application.Interfaces;
using LocalReservations.Domain.Entities;

namespace LocalReservations.Application.Services;

public class BusinessService : IBusinessService
{
    private readonly IBusinessRepository _repository;

    public BusinessService(IBusinessRepository repository)
    {
        _repository = repository;
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
        return MapToDto(created);
    }

    public async Task<BusinessDto?> GetByIdAsync(Guid id)
    {
        var business = await _repository.GetByIdAsync(id);
        return business == null ? null : MapToDto(business);
    }

    public async Task<IEnumerable<BusinessDto>> GetAllAsync()
    {
        var businesses = await _repository.GetAllAsync();
        return businesses.Select(MapToDto);
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
        return MapToDto(business);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid ownerId)
    {
        var business = await _repository.GetByIdAsync(id);
        if (business == null) return false;
        if (business.OwnerId != ownerId)
            throw new UnauthorizedAccessException("Not authorized");

        await _repository.DeleteAsync(id);
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