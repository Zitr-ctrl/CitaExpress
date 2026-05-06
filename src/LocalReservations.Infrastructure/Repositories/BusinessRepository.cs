using LocalReservations.Application.Interfaces;
using LocalReservations.Domain.Entities;
using LocalReservations.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalReservations.Infrastructure.Repositories;

public class BusinessRepository : IBusinessRepository
{
    private readonly AppDbContext _context;

    public BusinessRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Business?> GetByIdAsync(Guid id)
        => await _context.Businesses.FindAsync(id);

    public async Task<IEnumerable<Business>> GetAllAsync()
        => await _context.Businesses.ToListAsync();

    public async Task<Business> AddAsync(Business entity)
    {
        _context.Businesses.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(Business entity)
    {
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity == null) return false;
        _context.Businesses.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
        => await _context.Businesses.AnyAsync(b => b.Id == id);

    public async Task<IEnumerable<Business>> GetByOwnerAsync(Guid ownerId)
        => await _context.Businesses.Where(b => b.OwnerId == ownerId).ToListAsync();
}