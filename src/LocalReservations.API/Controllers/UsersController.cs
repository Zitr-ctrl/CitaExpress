using System.Security.Claims;
using LocalReservations.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalReservations.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var users = await _userRepository.GetAllAsync();
        return Ok(users.Select(u => new {
            u.Id,
            u.Name,
            u.Email,
            u.Phone,
            Role = u.Role.ToString(),
            u.CreatedAt
        }));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        var adminId = GetUserIdFromToken();
        if (id == adminId)
            return BadRequest(new { message = "Cannot delete your own account" });

        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        if (user.Role == Domain.Entities.UserRole.Admin)
            return BadRequest(new { message = "Cannot delete an admin user" });

        var result = await _userRepository.DeleteAsync(id);
        if (!result)
            return NotFound(new { message = "User not found" });

        return NoContent();
    }

    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }
}