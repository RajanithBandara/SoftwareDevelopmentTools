using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentApp.Data;
using System.Threading.Tasks;

[Route("api/health-status")]
[ApiController]
public class HealthCheckController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HealthCheckController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Checks if the API is running and database is accessible.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> CheckHealth()
    {
        try
        {
            // Simple database query to check connection
            var canConnect = await _context.Database.CanConnectAsync();

            return Ok(new
            {
                status = "Healthy",
                database = canConnect ? "Connected" : "Not Connected",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = "Unhealthy",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }
}