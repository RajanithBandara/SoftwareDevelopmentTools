using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentApp.Data;
using StudentApp.Models;
using System.Linq;
using System.Threading.Tasks;

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
        [HttpPost("sensors")]
        public async Task<IActionResult> AddSensor([FromBody] Sensor sensor)
        {
            if (sensor == null) return BadRequest("Sensor data is null.");

            _context.Sensors.Add(sensor);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSensors), new { id = sensor.Id }, sensor);
        }

        // PUT: api/settings/sensors/{id}
        [HttpPut("sensors/{id}")]
        public async Task<IActionResult> UpdateSensor(int id, [FromBody] Sensor updated)
        {
            if (id != updated.Id) return BadRequest("Sensor ID mismatch.");
            _context.Entry(updated).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Sensors.Any(s => s.Id == id))
                    return NotFound("Sensor not found.");
                throw;
            }

            return NoContent();
        }

        // DELETE: api/settings/sensors/{id}
        [HttpDelete("sensors/{id}")]
        public async Task<IActionResult> DeleteSensor(int id)
        {
            var sensor = await _context.Sensors.FindAsync(id);
            if (sensor == null) return NotFound("Sensor not found.");

            _context.Sensors.Remove(sensor);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/settings/sensors/{id}/status
        [HttpPut("sensors/{id}/status")]
        public async Task<IActionResult> UpdateSensorStatus(int id, [FromBody] bool status)
        {
            var sensor = await _context.Sensors.FindAsync(id);
            if (sensor == null) return NotFound("Sensor not found.");

            sensor.Status = status;
            _context.Entry(sensor).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(sensor);
        }

        // PUT: api/settings/sensors/reset
        // Resets every sensor's LastAqi back to zero
        [HttpPut("sensors/reset")]
        public async Task<IActionResult> ResetSensors()
        {
            var sensors = await _context.Sensors.ToListAsync();
            if (sensors.Count == 0)
                return NotFound("No sensors available to reset.");

            foreach (var sensor in sensors)
            {
                sensor.LastAqi = 0;
                _context.Entry(sensor).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "All sensors' LastAqi have been reset to 0." });
        }
    }
}
