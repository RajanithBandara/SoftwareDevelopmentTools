using Microsoft.EntityFrameworkCore;
using StudentApp.Models;

namespace StudentApp.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Sensor> Sensors { get; set; }
        public DbSet<AirQualityReading> AirQualityReadings { get; set; }
        public DbSet<Alert> Alerts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Optional: Additional configuration can go here if needed.
            // For example, setting up table names, relationships, or constraints.

            modelBuilder.Entity<User>()
                .ToTable("Users");

            modelBuilder.Entity<Sensor>()
                .ToTable("Sensors");

            modelBuilder.Entity<AirQualityReading>()
                .ToTable("AirQualityReadings");
            modelBuilder.Entity<Alert>()
                .ToTable("Alerts");
        }
    }
}