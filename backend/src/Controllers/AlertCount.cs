using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentApp.Data;
using System.Threading.Tasks;
using StudentApp.Models;


[Route("api/stats")]
[ApiController]
public class StatisticsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StatisticsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get total number of sensors
    [HttpGet("sensors-count")]
    public async Task<IActionResult> GetSensorsCount()
    {
        var count = await _context.Sensors.CountAsync();
        return Ok(new { sensorCount = count });
    }

    // Get total number of alerts
    [HttpGet("alerts-count")]
    public async Task<IActionResult> GetAlertsCount()
    {
        var count = await _context.Alerts.CountAsync();
        return Ok(new { alertCount = count });
    }

    [HttpGet("reading-count")]
    public async Task<IActionResult> GetReadingCount()
    {
        var count = await _context.AirQualityReadings.CountAsync();
        return Ok(new { readingCount = count });
    }

    // Get both counts together
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverviewStats()
    {
        var sensorCount = await _context.Sensors.CountAsync();
        var alertCount = await _context.Alerts.CountAsync();

        return Ok(new 
        { 
            sensorCount, 
            alertCount 
        });
    }
}