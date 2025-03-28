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
    // Define AQI threshold for alert generation.
    private const int AQIThreshold = 150;

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

                    // Check if the reading exceeds the threshold.
                    if (reading.AqiValue >= AQIThreshold)
                    {
                        // Create an alert.
                        var alert = new Alert
                        {
                            SensorId = sensor.Id,
                            AQILevel = reading.AqiValue,
                            AlertMessage = $"Sensor {sensor.Id} has a high AQI reading of {reading.AqiValue}.",
                            CreatedAt = DateTime.UtcNow
                        };

                        dbContext.Alerts.Add(alert);
                        _logger.LogInformation($"Alert created for Sensor {sensor.Id} with AQI {reading.AqiValue}.");
                    }
                }

                await dbContext.SaveChangesAsync(stoppingToken);
            }

            // Simulate readings every 30 minutes.
            await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
        }
    }
}
