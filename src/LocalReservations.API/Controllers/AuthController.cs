using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FluentValidation;
using LocalReservations.Application.DTOs;
using LocalReservations.Application.Interfaces;
using LocalReservations.Application.Services;
using LocalReservations.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;

namespace LocalReservations.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly IConfiguration _configuration;

    public AuthController(
        IUserRepository userRepository,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _configuration = configuration;
    }

    [HttpPost("register")]
    [EnableRateLimiting("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var validationResult = await _registerValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest(new { message = "Email already registered" });

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = AuthService.HashPassword(request.Password),
            Phone = request.Phone,
            Role = UserRole.Client
        };

        await _userRepository.AddAsync(user);

        var response = new AuthResponse
        {
            Token = GenerateToken(user),
            User = MapToDto(user)
        };

        return CreatedAtAction(nameof(GetCurrentUser), response);
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var validationResult = await _loginValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !AuthService.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials" });

        var response = new AuthResponse
        {
            Token = GenerateToken(user),
            User = MapToDto(user)
        };

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = GetUserIdFromToken();
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return NotFound();

        return Ok(MapToDto(user));
    }

    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString(),
            Phone = user.Phone,
            CreatedAt = user.CreatedAt
        };
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}