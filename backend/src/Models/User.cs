using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentApp.Models
{
    public class Sensor
    {
        [Key] public int Id { get; set; }

        [Required]
        [MaxLength(255)] // Limit location string length
        public string Location { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(9,6)")] // Ensure precision for coordinates
        public decimal Latitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(9,6)")]
        public decimal Longitude { get; set; }

        public int LastAqi { get; set; }

        public bool Status { get; set; } = true; // Default active
    }

    public class Alert
    {
        [Key] public int Id { get; set; }

        [Required] public int SensorId { get; set; }

        [ForeignKey(nameof(SensorId))] public Sensor? Sensor { get; set; } // Nullable to prevent query issues

        [Required]
        [Range(0, 500)] // Ensure AQI level is within standard range
        public int AqiValue { get; set; }

        [Required]
        [MaxLength(500)] // Limit message length
        public string AlertMessage { get; set; } = string.Empty;

        public string AqiLevel { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public Alert()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }

    public class AirQualityReading
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SensorId { get; set; }

        [ForeignKey(nameof(SensorId))]
        public Sensor? Sensor { get; set; }

        [Required]
        [Range(0, 500, ErrorMessage = "AQI must be between 0 and 500.")]
        public int AqiValue { get; set; }

        public string AQILevel { get; set; } = string.Empty;

        [Required]
        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    }


    public class User
    {
        [Key] public int Id { get; set; }

        [Required] [MaxLength(50)] public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)] // Ensure minimum security requirements
        public string PasswordHash { get; set; } = string.Empty;

        [Required] [MaxLength(30)] public string Role { get; set; } = "User"; // Default role
    }
}