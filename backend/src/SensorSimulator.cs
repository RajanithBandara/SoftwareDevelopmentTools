using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StudentApp.Data;

public class SensorSimulationService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SensorSimulationService> _logger;
    private static readonly Random _random = new();

    public SensorSimulationService(IServiceScopeFactory scopeFactory, ILogger<SensorSimulationService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var sensors = dbContext.Sensors.ToList();
                if (!sensors.Any())
                {
                    _logger.LogWarning("No sensors found in the database.");
                    await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                    continue;
                }

                foreach (var sensor in sensors)
                {
                    var reading = new AirQualityReading
                    {
                        SensorId = sensor.Id,
                        AqiValue = _random.Next(0, 500), // Simulated AQI value (0-500)
                        RecordedAt = DateTime.UtcNow
                    };

                    dbContext.AirQualityReadings.Add(reading);
                    _logger.LogInformation($"Sensor {sensor.Id}: AQI = {reading.AqiValue} recorded.");
                }

                await dbContext.SaveChangesAsync(stoppingToken);
            }

            await Task.Delay(TimeSpan.FromSeconds(600), stoppingToken); // Simulate readings every 30 seconds
        }
    }
}
