using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using StudentApp.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using StudentApp.Models;

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

    /// <summary>
    /// Registers a new user.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Password))
            return BadRequest(new { message = "Invalid input data." });

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == model.Email.ToLower()))
            return BadRequest(new { message = "Email already exists." });

        var user = new User
        {
            Username = model.Name,
            Email = model.Email.ToLower(),
            Role = model.Role
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

    /// <summary>
    /// Logs in a user and returns a JWT token along with the user role.
    /// </summary>
    [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel login)
        {
            if (login == null || string.IsNullOrWhiteSpace(login.Email) || string.IsNullOrWhiteSpace(login.Password))
                return BadRequest(new { message = "Invalid login data." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == login.Email.ToLower());
            if (user == null)
                return Unauthorized(new { message = "Invalid email or password." });

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, login.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Invalid email or password." });

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                userRole = user.Role,   // For frontend use
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.Role
                }
            });
        }


    /// <summary>
    /// Retrieves the current user's data based on the JWT.
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
            return Unauthorized(new { message = "User not found." });

        var user = await _context.Users
            .Where(u => u.Email.ToLower() == email.ToLower())
            .Select(u => new { u.Id, u.Username, u.Email, u.Role })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new { message = "User data not found." });

        return Ok(user);
    }

    /// <summary>
    /// Generates a JWT token including user role in the claims.
    /// </summary>
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
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role)  // Include role in JWT
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

// DTOs for user registration and login
public class RegisterModel
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string Role { get; set; }
}

public class LoginModel
{
    public string Email { get; set; }
    public string Password { get; set; }
}
