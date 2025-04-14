using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentApp.Data;
using System.Threading.Tasks;
using StudentApp.Models;

namespace NetBackend.Controllers;

[ApiController]
[Route("api/airquality")]
public class AirQualityController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AirQualityController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        // Fetch historical AQI readings for all sensors sorted by the latest recorded timestamp.
        var historyData = await _context.AirQualityReadings
            .OrderByDescending(r => r.RecordedAt)
            .Select(r => new 
            {
                r.Id,
                r.SensorId,
                aqiValue = r.AqiValue,
                r.RecordedAt
            })
            .ToListAsync();

        return Ok(historyData);
    }
}