using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using StudentApp.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[Route("api/users")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IConfiguration _configuration;

    public UsersController(ApplicationDbContext context, IPasswordHasher<User> passwordHasher, IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Password))
            return BadRequest("Invalid input data.");

        // Check if the email already exists
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == model.Email.ToLower()))
            return BadRequest("Email already exists.");

        // Create the new user
        var user = new User
        {
            Username = model.Name,
            Email = model.Email.ToLower(),
            Role = model.Role  // Use the Role property from the DTO
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, model.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Register), new { id = user.Id }, new 
        { 
            user.Id, 
            user.Username, 
            user.Email, 
            user.Role 
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel login)
    {
        if (login == null || string.IsNullOrWhiteSpace(login.Email) || string.IsNullOrWhiteSpace(login.Password))
            return BadRequest("Invalid login data.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == login.Email.ToLower());

        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            return Unauthorized("Invalid email or password.");

        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, login.Password);
        if (verificationResult == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid email or password.");

        var token = GenerateJwtToken(user);
        return Ok(new 
        { 
            token, 
            user = new 
            { 
                user.Id, 
                user.Username, 
                user.Email, 
                user.Role 
            } 
        });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
            return Unauthorized("User not found.");

        var user = await _context.Users
            .Where(u => u.Email.ToLower() == email.ToLower())
            .Select(u => new { u.Id, u.Username, u.Email, u.Role })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound("User data not found.");

        return Ok(user);
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["JwtSettings:SecretKey"];
        if (string.IsNullOrEmpty(jwtKey))
            throw new Exception("JWT SecretKey is missing in configuration.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// DTOs
public class RegisterModel
{
    public string Name { get; set; }        // Maps to User.Username
    public string Email { get; set; }
    public string Password { get; set; }
    public string Role { get; set; }        // Example: "Admin" or "User"
}

public class LoginModel
{
    public string Email { get; set; }
    public string Password { get; set; }
}
