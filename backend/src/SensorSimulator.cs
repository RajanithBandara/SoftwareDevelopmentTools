using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StudentApp.Data;
using StudentApp.Models;

public class SensorSimulationService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SensorSimulationService> _logger;
    private static readonly Random _random = new();
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
                var activeSensors = dbContext.Sensors.Where(s => s.Status).ToList();

                if (!activeSensors.Any())
                {
                    _logger.LogWarning("No active sensors found.");
                    await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                    continue;
                }

                foreach (var sensor in activeSensors)
                {
                    // Use sensor.LastAqi if it exists (non-zero), otherwise, generate a random starting value.
                    double previousAqi = sensor.LastAqi > 0 ? sensor.LastAqi : _random.Next(30, 100);
                    double newAqi = GenerateRealisticAQI(previousAqi);

                    // Create new AQI reading for the sensor.
                    var reading = new AirQualityReading
                    {
                        SensorId = sensor.Id,
                        AqiValue = (int)newAqi,
                        RecordedAt = DateTime.UtcNow
                    };
                    dbContext.AirQualityReadings.Add(reading);

                    // Update the sensor's last known AQI reading.
                    sensor.LastAqi = (int)newAqi;
                    dbContext.Sensors.Update(sensor);

                    _logger.LogInformation($"Sensor {sensor.Id}: Previous AQI = {(int)previousAqi}, New AQI = {(int)newAqi} recorded.");

                    // Generate an alert if the AQI exceeds threshold.
                    if (newAqi >= AQIThreshold)
                    {
                        var alert = new Alert
                        {
                            SensorId = sensor.Id,
                            AQILevel = (int)newAqi,
                            AlertMessage = $"Sensor {sensor.Id} has a high AQI reading of {(int)newAqi}.",
                            CreatedAt = DateTime.UtcNow
                        };

                        dbContext.Alerts.Add(alert);
                        _logger.LogInformation($"Alert created for Sensor {sensor.Id} with AQI {(int)newAqi}.");
                    }
                }

                await dbContext.SaveChangesAsync(stoppingToken);
            }

            await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
        }
    }

    /// <summary>
    /// Generates a realistic AQI value based on the previous reading.
    /// Incorporates a daily cycle (using a sine function), a trend factor, and small random fluctuations.
    /// </summary>
    private double GenerateRealisticAQI(double previousAqi)
    {
        double timeFactor = Math.Sin((DateTime.UtcNow.Hour / 24.0) * (2 * Math.PI)); // Daily cycle variation
        double randomFluctuation = _random.NextDouble() * 20 - 10; // Random variation between -10 and +10
        // Calculate new AQI influenced by previous value and daily variation
        double trendFactor = (previousAqi * 0.9) + (timeFactor * 50) + randomFluctuation;

        return Math.Clamp(trendFactor, 30, 500); // Ensure AQI remains within valid range
    }
}
