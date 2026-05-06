using LocalReservations.Application.DTOs;
using LocalReservations.Application.Interfaces;
using LocalReservations.Domain.Entities;

namespace LocalReservations.Application.Services;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _repository;
    private readonly IBusinessRepository _businessRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUserRepository _userRepository;

    public ReservationService(
        IReservationRepository repository,
        IBusinessRepository businessRepository,
        IServiceRepository serviceRepository,
        IUserRepository userRepository)
    {
        _repository = repository;
        _businessRepository = businessRepository;
        _serviceRepository = serviceRepository;
        _userRepository = userRepository;
    }

    public async Task<ReservationDto> CreateAsync(CreateReservationRequest request, Guid userId)
    {
        var business = await _businessRepository.GetByIdAsync(request.BusinessId);
        if (business == null)
            throw new InvalidOperationException("Business not found");

        var service = await _serviceRepository.GetByIdAsync(request.ServiceId);
        if (service == null)
            throw new InvalidOperationException("Service not found");

        var startTime = TimeSpan.Parse(request.StartTime);
        var endTime = startTime.Add(TimeSpan.FromMinutes(service.DurationMinutes));

        var hasConflict = await _repository.HasConflictAsync(request.BusinessId, request.ReservationDate.Date, startTime, endTime);
        if (hasConflict)
            throw new InvalidOperationException("Time slot already booked");

        var reservation = new Reservation
        {
            ReservationDate = request.ReservationDate.Date,
            StartTime = startTime,
            EndTime = endTime,
            Status = ReservationStatus.Confirmed,
            Notes = request.Notes,
            UserId = userId,
            BusinessId = request.BusinessId,
            ServiceId = request.ServiceId
        };

        var created = await _repository.AddAsync(reservation);
        var user = await _userRepository.GetByIdAsync(userId);
        return MapToDto(created, business, service, user);
    }

    public async Task<ReservationDto?> GetByIdAsync(Guid id)
    {
        var reservation = await _repository.GetByIdAsync(id);
        if (reservation == null) return null;

        var business = await _businessRepository.GetByIdAsync(reservation.BusinessId);
        var service = await _serviceRepository.GetByIdAsync(reservation.ServiceId);
        var user = await _userRepository.GetByIdAsync(reservation.UserId);

        return MapToDto(reservation, business!, service!, user);
    }

    public async Task<IEnumerable<ReservationDto>> GetByUserAsync(Guid userId)
    {
        var reservations = await _repository.GetByUserAsync(userId);
        var result = new List<ReservationDto>();

        foreach (var reservation in reservations)
        {
            var business = await _businessRepository.GetByIdAsync(reservation.BusinessId);
            var service = await _serviceRepository.GetByIdAsync(reservation.ServiceId);
            var user = await _userRepository.GetByIdAsync(reservation.UserId);
            result.Add(MapToDto(reservation, business!, service!, user));
        }

        return result;
    }

    public async Task<IEnumerable<ReservationDto>> GetByBusinessAsync(Guid businessId)
    {
        var reservations = await _repository.GetByBusinessAsync(businessId);
        var business = await _businessRepository.GetByIdAsync(businessId);
        var result = new List<ReservationDto>();

        foreach (var reservation in reservations)
        {
            var service = await _serviceRepository.GetByIdAsync(reservation.ServiceId);
            result.Add(MapToDto(reservation, business!, service!));
        }

        return result;
    }

    public async Task<bool> CancelAsync(Guid id, Guid userId)
    {
        var reservation = await _repository.GetByIdAsync(id);
        if (reservation == null) return false;
        if (reservation.UserId != userId)
            throw new UnauthorizedAccessException("Not authorized");

        reservation.Status = ReservationStatus.Cancelled;
        reservation.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(reservation);

        return true;
    }

    public async Task<IEnumerable<AvailableSlotDto>> GetAvailableSlotsAsync(Guid businessId, DateTime date)
    {
        var business = await _businessRepository.GetByIdAsync(businessId);
        if (business == null)
            throw new InvalidOperationException("Business not found");

        var existingReservations = await _repository.GetByBusinessAndDateAsync(businessId, date.Date);
        var bookedSlots = existingReservations
            .Where(r => r.Status != ReservationStatus.Cancelled)
            .Select(r => r.StartTime)
            .ToHashSet();

        var slots = new List<AvailableSlotDto>();
        var currentSlot = business.OpenTime;

        while (currentSlot + TimeSpan.FromMinutes(business.SlotDurationMinutes) <= business.CloseTime)
        {
            if (!bookedSlots.Contains(currentSlot))
            {
                slots.Add(new AvailableSlotDto
                {
                    StartTime = currentSlot.ToString(@"hh\:mm"),
                    EndTime = currentSlot.Add(TimeSpan.FromMinutes(business.SlotDurationMinutes)).ToString(@"hh\:mm")
                });
            }
            currentSlot = currentSlot.Add(TimeSpan.FromMinutes(business.SlotDurationMinutes));
        }

        return slots;
    }

    public async Task<IEnumerable<ReservationDto>> GetAllByOwnerAsync(Guid ownerId)
    {
        var reservations = await _repository.GetAllByOwnerAsync(ownerId);
        var result = new List<ReservationDto>();

        foreach (var reservation in reservations)
        {
            result.Add(MapToDto(reservation, reservation.Business, reservation.Service, reservation.User));
        }

        return result;
    }

    public async Task<bool> CancelAsAdminAsync(Guid reservationId)
    {
        var reservation = await _repository.GetByIdAsync(reservationId);
        if (reservation == null) return false;

        reservation.Status = ReservationStatus.Cancelled;
        reservation.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(reservation);

        return true;
    }

    private static ReservationDto MapToDto(Reservation reservation, Business business, Service service, User? user = null)
    {
        return new ReservationDto
        {
            Id = reservation.Id,
            ReservationDate = reservation.ReservationDate,
            StartTime = reservation.StartTime.ToString(@"hh\:mm"),
            EndTime = reservation.EndTime.ToString(@"hh\:mm"),
            Status = reservation.Status.ToString(),
            Notes = reservation.Notes,
            UserId = reservation.UserId,
            UserName = user?.Name ?? string.Empty,
            UserEmail = user?.Email ?? string.Empty,
            UserPhone = user?.Phone ?? string.Empty,
            BusinessId = reservation.BusinessId,
            BusinessName = business?.Name ?? string.Empty,
            ServiceId = reservation.ServiceId,
            ServiceName = service?.Name ?? string.Empty,
            CreatedAt = reservation.CreatedAt
        };
    }
}