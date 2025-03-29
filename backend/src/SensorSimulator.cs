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
    private const int AQIThreshold = 150;
    private readonly Dictionary<int, double> _sensorAqiValues = new(); // Store AQI trends per sensor

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
                    double previousAqi = _sensorAqiValues.ContainsKey(sensor.Id) ? _sensorAqiValues[sensor.Id] : _random.Next(30, 100);
                    double newAqi = GenerateRealisticAQI(previousAqi);

                    var reading = new AirQualityReading
                    {
                        SensorId = sensor.Id,
                        AqiValue = (int)newAqi,
                        RecordedAt = DateTime.UtcNow
                    };

                    dbContext.AirQualityReadings.Add(reading);
                    _sensorAqiValues[sensor.Id] = newAqi; // Update stored AQI value

                    _logger.LogInformation($"Sensor {sensor.Id}: AQI = {(int)newAqi} recorded.");

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
    /// Generates a more realistic AQI value with gradual change and daily variation.
    /// </summary>
    private double GenerateRealisticAQI(double previousAqi)
    {
        double timeFactor = Math.Sin((DateTime.UtcNow.Hour / 24.0) * (2 * Math.PI)); // Daily cycle
        double randomFluctuation = _random.NextDouble() * 20 - 10; // Small random variation (-10 to +10)
        double trendFactor = (previousAqi * 0.9) + (timeFactor * 50) + randomFluctuation;

        return Math.Clamp(trendFactor, 0, 500); // Ensure AQI stays within valid range
    }
}
