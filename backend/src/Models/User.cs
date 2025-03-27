using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Sensor
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Location { get; set; }

    [Required]
    public decimal Latitude { get; set; }

    [Required]
    public decimal Longitude { get; set; }

    public bool Status { get; set; } = true;
}

public class AirQualityReading
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int SensorId { get; set; }

    [ForeignKey("SensorId")]
    public Sensor Sensor { get; set; }

    [Required]
    public int AqiValue { get; set; }

    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
}

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Username { get; set; }
    [Required]
    public string Email { get; set; }

    [Required]
    public string PasswordHash { get; set; }

    [Required]
    public string Role { get; set; }
}