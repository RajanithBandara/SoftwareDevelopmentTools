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



         // PUT: api/settings/sensors/{id}
        // Updates sensor settings (location, coordinates, etc.)
        [HttpPut("sensors/{id}")]
        public async Task<IActionResult> UpdateSensor(int id, [FromBody] Sensor sensor)
        {
            if (id != sensor.Id)
            {
                return BadRequest("Sensor ID mismatch.");
            }

            _context.Entry(sensor).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SensorExists(id))
                {
                    return NotFound("Sensor not found.");
                }
                else
                {
                    throw;
                }
            }

            
            return NoContent();
        }




        // DELETE: api/settings/sensors/{id}
        // Deletes a sensor
        [HttpDelete("sensors/{id}")]
        public async Task<IActionResult> DeleteSensor(int id)
        {
            var sensor = await _context.Sensors.FindAsync(id);
            if (sensor == null)
            {
                return NotFound("Sensor not found.");
            }

            _context.Sensors.Remove(sensor);
            await _context.SaveChangesAsync();
            return NoContent();
        }



        // PUT: api/settings/sensors/{id}/status
        // Updates sensor status (on/off)
        [HttpPut("sensors/{id}/status")]
        public async Task<IActionResult> UpdateSensorStatus(int id, [FromBody] bool status)
        {
            var sensor = await _context.Sensors.FindAsync(id);
            if (sensor == null)
            {
                return NotFound("Sensor not found.");
            }

            sensor.Status = status;
            _context.Entry(sensor).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(sensor);
        }

        private bool SensorExists(int id)
        {
            return _context.Sensors.Any(s => s.Id == id);
        }
    }
}





