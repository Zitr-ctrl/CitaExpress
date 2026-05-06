using LocalReservations.Application.DTOs;

namespace LocalReservations.Application.Interfaces;

public interface IReservationService
{
    Task<ReservationDto> CreateAsync(CreateReservationRequest request, Guid userId);
    Task<ReservationDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<ReservationDto>> GetByUserAsync(Guid userId);
    Task<IEnumerable<ReservationDto>> GetByBusinessAsync(Guid businessId);
    Task<bool> CancelAsync(Guid id, Guid userId);
    Task<IEnumerable<AvailableSlotDto>> GetAvailableSlotsAsync(Guid businessId, DateTime date);
    Task<IEnumerable<ReservationDto>> GetAllByOwnerAsync(Guid ownerId);
    Task<bool> CancelAsAdminAsync(Guid reservationId);
}