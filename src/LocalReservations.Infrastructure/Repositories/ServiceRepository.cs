using LocalReservations.Application.Interfaces;
using LocalReservations.Domain.Entities;
using LocalReservations.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalReservations.Infrastructure.Repositories;

public class ServiceRepository : IServiceRepository
{
    private readonly AppDbContext _context;

    public ServiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Service?> GetByIdAsync(Guid id)
        => await _context.Services.FindAsync(id);

    public async Task<IEnumerable<Service>> GetAllAsync()
        => await _context.Services.ToListAsync();

    public async Task<Service> AddAsync(Service entity)
    {
        _context.Services.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(Service entity)
    {
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity == null) return false;
        _context.Services.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
        => await _context.Services.AnyAsync(s => s.Id == id);

    public async Task<IEnumerable<Service>> GetByBusinessAsync(Guid businessId)
        => await _context.Services.Where(s => s.BusinessId == businessId).ToListAsync();
}