using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentApp.Data;
using System.Linq;
using System.Threading.Tasks;
using StudentApp.Models;


namespace StudentApp.Controllers
{
    [ApiController]
    [Route("api/aqi")]
    public class AqiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AqiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("levels")]
        public async Task<IActionResult> GetAqiLevels()
        {
            if (_context.Alerts == null)
            {
                return NotFound("No alerts found.");
            }

            var aqiLevels = await _context.Alerts
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    sensorId = a.SensorId,
                    AQIValue = a.AqiValue,
                    AQILevel = a.AqiLevel,
                })
                .ToListAsync();

            return Ok(aqiLevels);
        }
    }
}