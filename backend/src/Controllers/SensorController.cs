using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentApp.Data;


namespace StudentApp.Controllers;

[ApiController]
[Route("api/sensors")]
public class SensorsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SensorsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSensors()
    {
        // Query each sensor and join the latest AQI reading (if any)
        var sensorData = await _context.Sensors
            .Select(sensor => new 
            {
                sensor.Id,
                sensor.Location,
                sensor.Latitude,
                sensor.Longitude,
                // Retrieves the most recent AQI reading for the sensor.
                aqiValue = _context.AirQualityReadings
                    .Where(r => r.SensorId == sensor.Id)
                    .OrderByDescending(r => r.RecordedAt)
                    .Select(r => r.AqiValue)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(sensorData);
    }
}