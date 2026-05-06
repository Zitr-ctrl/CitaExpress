using LocalReservations.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LocalReservations.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).HasConversion<string>();
        });

        modelBuilder.Entity<Business>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.Owner)
                  .WithMany(u => u.OwnedBusinesses)
                  .HasForeignKey(e => e.OwnerId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Price).HasPrecision(10, 2);
            entity.HasOne(e => e.Business)
                  .WithMany(b => b.Services)
                  .HasForeignKey(e => e.BusinessId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Reservations)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Business)
                  .WithMany(b => b.Reservations)
                  .HasForeignKey(e => e.BusinessId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Service)
                  .WithMany(s => s.Reservations)
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(e => new { e.BusinessId, e.ReservationDate, e.StartTime });
        });
    }
}