using System.Security.Claims;
using FluentValidation;
using LocalReservations.Application.DTOs;
using LocalReservations.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalReservations.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;
    private readonly IValidator<CreateReservationRequest> _createValidator;

    public ReservationsController(
        IReservationService reservationService,
        IValidator<CreateReservationRequest> createValidator)
    {
        _reservationService = reservationService;
        _createValidator = createValidator;
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create([FromBody] CreateReservationRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var userId = GetUserIdFromToken();
        var reservation = await _reservationService.CreateAsync(request, userId);

        return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, reservation);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReservationDto>> GetById(Guid id)
    {
        var reservation = await _reservationService.GetByIdAsync(id);
        if (reservation == null)
            return NotFound(new { message = "Reservation not found" });

        return Ok(reservation);
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetMyReservations()
    {
        var userId = GetUserIdFromToken();
        var reservations = await _reservationService.GetByUserAsync(userId);
        return Ok(reservations);
    }

    [HttpGet("business/{businessId}")]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetByBusiness(Guid businessId)
    {
        var reservations = await _reservationService.GetByBusinessAsync(businessId);
        return Ok(reservations);
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult> Cancel(Guid id)
    {
        var userId = GetUserIdFromToken();
        var result = await _reservationService.CancelAsync(id, userId);

        if (!result)
            return NotFound(new { message = "Reservation not found" });

        return NoContent();
    }

    [HttpGet("slots/{businessId}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<AvailableSlotDto>>> GetAvailableSlots(Guid businessId, [FromQuery] DateTime date)
    {
        var slots = await _reservationService.GetAvailableSlotsAsync(businessId, date);
        return Ok(slots);
    }

    [HttpGet("owner/all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetOwnerReservations()
    {
        var ownerId = GetUserIdFromToken();
        var reservations = await _reservationService.GetAllByOwnerAsync(ownerId);
        return Ok(reservations);
    }

    [HttpPost("{id}/admin-cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CancelAsAdmin(Guid id)
    {
        var result = await _reservationService.CancelAsAdminAsync(id);
        if (!result)
            return NotFound(new { message = "Reservation not found" });
        return NoContent();
    }

    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }
}