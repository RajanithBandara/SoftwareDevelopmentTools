using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentApp.Data;
using System.Linq;
using System.Threading.Tasks;
using StudentApp.Models;

namespace StudentApp.Controllers
{
    [Route("api/settings")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }


         // GET: api/settings/sensors
        [HttpGet("sensors")]
        public async Task<IActionResult> GetSensors()
        {
            var sensors = await _context.Sensors.ToListAsync();
            return Ok(sensors);
        }




         // POST: api/settings/sensors
        // Adds a new sensor
        [HttpPost("sensors")]
        public async Task<IActionResult> AddSensor([FromBody] Sensor sensor)
        {
            if (sensor == null)
            {
                return BadRequest("Sensor data is null.");
            }


            _context.Sensors.Add(sensor);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSensors), new { id = sensor.Id }, sensor);
        }


