using FluentValidation;
using LocalReservations.Application.DTOs;
using LocalReservations.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalReservations.API.Controllers;

[ApiController]
[Route("api/businesses/{businessId}/services")]
[Authorize]
public class ServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;
    private readonly IValidator<CreateServiceRequest> _createValidator;
    private readonly IValidator<UpdateServiceRequest> _updateValidator;

    public ServicesController(
        IServiceService serviceService,
        IValidator<CreateServiceRequest> createValidator,
        IValidator<UpdateServiceRequest> updateValidator)
    {
        _serviceService = serviceService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ServiceDto>>> GetByBusiness(Guid businessId)
    {
        var services = await _serviceService.GetByBusinessAsync(businessId);
        return Ok(services);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceDto>> GetById(Guid businessId, Guid id)
    {
        var service = await _serviceService.GetByIdAsync(id);
        if (service == null || service.BusinessId != businessId)
            return NotFound(new { message = "Service not found" });

        return Ok(service);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceDto>> Create(Guid businessId, [FromBody] CreateServiceRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var service = await _serviceService.CreateAsync(businessId, request);

        return CreatedAtAction(nameof(GetById), new { businessId, id = service.Id }, service);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ServiceDto>> Update(Guid businessId, Guid id, [FromBody] UpdateServiceRequest request)
    {
        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var service = await _serviceService.GetByIdAsync(id);
        if (service == null || service.BusinessId != businessId)
            return NotFound(new { message = "Service not found" });

        var updated = await _serviceService.UpdateAsync(id, request);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid businessId, Guid id)
    {
        var service = await _serviceService.GetByIdAsync(id);
        if (service == null || service.BusinessId != businessId)
            return NotFound(new { message = "Service not found" });

        await _serviceService.DeleteAsync(id);
        return NoContent();
    }
}