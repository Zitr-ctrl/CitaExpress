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
public class BusinessesController : ControllerBase
{
    private readonly IBusinessService _businessService;
    private readonly IBusinessRepository _businessRepository;
    private readonly IValidator<CreateBusinessRequest> _createValidator;
    private readonly IValidator<UpdateBusinessRequest> _updateValidator;

    public BusinessesController(
        IBusinessService businessService,
        IBusinessRepository businessRepository,
        IValidator<CreateBusinessRequest> createValidator,
        IValidator<UpdateBusinessRequest> updateValidator)
    {
        _businessService = businessService;
        _businessRepository = businessRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<BusinessDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 50) pageSize = 50;

        var result = await _businessService.GetAllPaginatedAsync(page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<BusinessDto>> GetById(Guid id)
    {
        var business = await _businessService.GetByIdAsync(id);
        if (business == null)
            return NotFound(new { message = "Business not found" });

        return Ok(business);
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<BusinessDto>>> GetMyBusinesses()
    {
        var ownerId = GetUserIdFromToken();
        var businesses = await _businessService.GetByOwnerAsync(ownerId);
        return Ok(businesses);
    }

    [HttpPost]
    public async Task<ActionResult<BusinessDto>> Create([FromBody] CreateBusinessRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var ownerId = GetUserIdFromToken();
        var business = await _businessService.CreateAsync(request, ownerId);

        return CreatedAtAction(nameof(GetById), new { id = business.Id }, business);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BusinessDto>> Update(Guid id, [FromBody] UpdateBusinessRequest request)
    {
        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var ownerId = GetUserIdFromToken();
        var business = await _businessService.UpdateAsync(id, request, ownerId);

        return Ok(business);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var ownerId = GetUserIdFromToken();
        var result = await _businessService.DeleteAsync(id, ownerId);

        if (!result)
            return NotFound(new { message = "Business not found" });

        return NoContent();
    }

    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpPut("{id}/whatsapp-toggle")]
    public async Task<ActionResult> ToggleWhatsAppNotifications(Guid id, [FromBody] ToggleWhatsAppRequest request)
    {
        var ownerId = GetUserIdFromToken();
        var business = await _businessRepository.GetByIdAsync(id);

        if (business == null)
            return NotFound(new { message = "Business not found" });

        if (business.OwnerId != ownerId)
            return Forbid();

        business.WhatsAppNotificationsEnabled = request.Enabled;
        business.UpdatedAt = DateTime.UtcNow;
        await _businessRepository.UpdateAsync(business);

        return Ok(new { message = "WhatsApp notifications updated", enabled = request.Enabled });
    }
}

public class ToggleWhatsAppRequest
{
    public bool Enabled { get; set; }
}