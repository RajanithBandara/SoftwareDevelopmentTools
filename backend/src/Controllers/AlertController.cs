using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentApp.Data;
using System;
using System.Linq;
using System.Threading.Tasks;
using StudentApp.Models;


namespace StudentApp.Controllers
{
    [ApiController]
    [Route("api/alerts")]
    public class AlertsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AlertsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Fetches all alerts, ordered by the most recent.
        /// </summary>
        /// <returns>List of alerts with relevant details.</returns>
        [HttpGet]
        public async Task<IActionResult> GetAlerts()
        {
            if (_context.Alerts == null)
            {
                return NotFound(new { message = "No alerts found." });
            }

            try
            {
                var alerts = await _context.Alerts
                    .Include(a => a.Sensor) // Fetch sensor details if needed
                    .OrderByDescending(a => a.CreatedAt)
                    .Select(a => new
                    {
                        id = a.Id,
                        sensorId = a.SensorId,
                        location = a.Sensor != null ? a.Sensor.Location : "Unknown", // Handle null sensor
                        AQIlevel = a.AQILevel.ToString(), // Convert to string
                        alertMessage = a.AlertMessage,
                        createdAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss") // Format date
                    })
                    .ToListAsync();

                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching alerts.", error = ex.Message });
            }
        }
    }
}