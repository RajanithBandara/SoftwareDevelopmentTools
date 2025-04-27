using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Threading.Tasks;
using StudentApp.Data;
using StudentApp.Models;

namespace StudentApp.Controllers
{
    [Route("api/user-edit")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UsersController(ApplicationDbContext context, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        /// <summary>
        /// Gets all users.
        /// </summary>
        
         [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        /// <summary>
        /// Registers a new user.
        /// </summary>
        
        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] CreateUserModel model)
        {
            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
                return BadRequest(new { message = "Email already in use." });

            var user = new User
            {
                Username = model.Name,
                Email = model.Email,
                Role = model.Role,
                PasswordHash = _passwordHasher.HashPassword(null, model.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
        }

        /// <summary>
        /// Updates an existing user.
        /// </summary>
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserModel model)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            user.Username = model.Name ?? user.Username;
            user.Email = model.Email ?? user.Email;
            user.Role = model.Role ?? user.Role;

            if (!string.IsNullOrWhiteSpace(model.Password))
                user.PasswordHash = _passwordHasher.HashPassword(user, model.Password);

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        /// <summary>
        /// Deletes a user.
        /// </summary>
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully." });
        }
    }
        
         // DTOs (Data Transfer Objects) for user creation and updating
    public class CreateUserModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
    }

    public class UpdateUserModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
    }
}