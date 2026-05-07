using LocalReservations.Application.DTOs;
using LocalReservations.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalReservations.API.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationLogRepository _notificationLogRepository;
    private readonly IBusinessRepository _businessRepository;

    public NotificationsController(
        INotificationLogRepository notificationLogRepository,
        IBusinessRepository businessRepository)
    {
        _notificationLogRepository = notificationLogRepository;
        _businessRepository = businessRepository;
    }

    [HttpGet("logs")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<NotificationLogDto>>> GetLogs(
        [FromQuery] Guid? reservationId,
        [FromQuery] Guid? businessId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] bool? success)
    {
        var filter = new NotificationLogFilterDto
        {
            ReservationId = reservationId,
            BusinessId = businessId,
            FromDate = fromDate,
            ToDate = toDate,
            Success = success
        };

        var logs = await _notificationLogRepository.GetByFilterAsync(filter);
        var dtos = logs.Select(MapToDto);
        return Ok(dtos);
    }

    [HttpGet("logs/reservation/{reservationId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<NotificationLogDto>>> GetLogsByReservation(Guid reservationId)
    {
        var logs = await _notificationLogRepository.GetByReservationIdAsync(reservationId);
        var dtos = logs.Select(MapToDto);
        return Ok(dtos);
    }

    private static NotificationLogDto MapToDto(Domain.Entities.NotificationLog log)
    {
        return new NotificationLogDto
        {
            Id = log.Id,
            ReservationId = log.ReservationId,
            Type = log.Type.ToString(),
            PhoneNumber = log.PhoneNumber,
            MessageContent = log.MessageContent,
            SentAt = log.SentAt,
            Success = log.Success,
            ErrorMessage = log.ErrorMessage
        };
    }
}
