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
    [HttpGet("latest-readings")]
    public async Task<IActionResult> GetLatestSensorReadings()
    {
        var latestReadings = await _context.AirQualityReadings
            .GroupBy(r => r.SensorId)
            .Select(g => new 
            {
                SensorId = g.Key,
                Location = g.FirstOrDefault().Sensor.Location, // Assuming the Sensor has a Location property
                Status = g.FirstOrDefault().Sensor.Status,   // Assuming the Sensor has a Status property
                Readings = g.OrderByDescending(r => r.RecordedAt)
                    .Take(4)
                    .Select(r => new 
                    {
                        r.Id,
                        r.AqiValue,
                        r.RecordedAt
                    })
                    .ToList()
            })
            .ToListAsync();

        if (!latestReadings.Any())
        {
            return NotFound(new { message = "No active sensors found." });
        }

        return Ok(latestReadings);
    }
}