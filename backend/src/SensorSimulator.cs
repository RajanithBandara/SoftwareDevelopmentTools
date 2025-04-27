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
                    // Use sensor.LastAqi if it exists (non-zero), otherwise generate a random starting value.
                    double previousAqi = sensor.LastAqi > 0 ? sensor.LastAqi : _random.Next(30, 100);
                    double newAqi = GenerateRealisticAQI(previousAqi);

                    // Create new AQI reading for the sensor.
                    var reading = new AirQualityReading
                    {
                        SensorId = sensor.Id,
                        AqiValue = (int)newAqi,
                        RecordedAt = DateTime.UtcNow,
                        AQILevel = newAqi < 50 ? "Good" :
                            newAqi < 100 && newAqi >= 50 ? "Moderate" :
                            newAqi < 150 && newAqi >= 100 ? "Unhealthy for Sensitive Groups" :
                            newAqi < 200 && newAqi >= 150 ? "Unhealthy" :
                            newAqi < 300 && newAqi >= 200 ? "Very Unhealthy" : "Hazardous",
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
                            AqiValue = (int)newAqi,
                            AlertMessage = $"Sensor {sensor.Id} has a high AQI reading of {(int)newAqi}.",
                            AqiLevel = newAqi < 50 ? "Good" :
                                       newAqi < 100 && newAqi >= 50 ? "Moderate" :
                                       newAqi < 150 && newAqi >= 100 ? "Unhealthy for Sensitive Groups" :
                                       newAqi < 200 && newAqi >= 150 ? "Unhealthy" :
                                       newAqi < 300 && newAqi >= 200 ? "Very Unhealthy" : "Hazardous",
                            CreatedAt = DateTime.UtcNow
                        };

                        dbContext.Alerts.Add(alert);
                        _logger.LogInformation($"Alert created for Sensor {sensor.Id} with AQI {(int)newAqi}.");
                    }
                }

                await dbContext.SaveChangesAsync(stoppingToken);
            }

            // Simulate a realistic delay between readings (e.g., 30 minutes)
            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }
    }
    

    /// <summary>
    /// Generates a realistic AQI value based on the previous reading.
    /// Incorporates the daily cycle, rush hour effects, and random fluctuations.
    /// </summary>
    private double GenerateRealisticAQI(double previousAqi)
    {
        // Calculate time as hours with fractional minutes for a smoother cycle.
        double currentTime = DateTime.UtcNow.Hour + DateTime.UtcNow.Minute / 60.0;
        // Daily cycle: oscillates between -1 and 1.
        double dailyCycle = Math.Sin((currentTime / 24.0) * 2 * Math.PI);

        // Rush hour factor: Add a positive boost during typical morning and evening rush hours.
        double rushHourBoost = 0;
        if (currentTime >= 7 && currentTime < 9)  // Morning rush hour
            rushHourBoost = 15;
        else if (currentTime >= 17 && currentTime < 19)  // Evening rush hour
            rushHourBoost = 15;

        // Reduced random fluctuation for smoother change.
        double randomFluctuation = _random.NextDouble() * 15 - 7.5; // range: -7.5 to +7.5

        // Calculate new AQI influenced by the previous value, daily cycle, rush hour boost, and random noise.
        double trendFactor = previousAqi * 0.85 + (dailyCycle * 50) + rushHourBoost + randomFluctuation;

        // Clamp the AQI value to a realistic range.
        return Math.Clamp(trendFactor, 30, 500);
    }
}


