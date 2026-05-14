using Microsoft.EntityFrameworkCore;
using URide.Application.Interfaces;
using URide.Domain.Entities;
using URide.Infrastructure.Persistence;

namespace URide.Infrastructure.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly AppDbContext _context;
    public AuthRepository(AppDbContext context) => _context = context;

    public async Task<bool> EmailExistsAsync(string email) =>
        await _context.Users.AnyAsync(u => u.Email == email);

    public async Task CreateUserWithTokenAsync(User user, VerificationToken token)
    {
        // Se agrega ambas entidades; EF Core manejará la transacción internamente al hacer SaveChanges
        await _context.Users.AddAsync(user);
        await _context.VerificationTokens.AddAsync(token);
        await _context.SaveChangesAsync();
    }
    public async Task<VerificationToken?> GetTokenWithUserAsync(string tokenHash, string type)
    {
        return await _context.VerificationTokens
            .Include(v => v.User) // Hace el JOIN automático con la tabla users
            .FirstOrDefaultAsync(v => v.TokenHash == tokenHash && v.Type == type);
    }

    public async Task UpdateUserAndTokenAsync(User user, VerificationToken? token) // <-- Agrega el ?
    {
        _context.Users.Update(user);

        // Solo actualizamos el token si realmente nos enviaron uno
        if (token != null)
        {
            _context.VerificationTokens.Update(token);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task CreateTokenAsync(VerificationToken token)
    {
        await _context.VerificationTokens.AddAsync(token);
        await _context.SaveChangesAsync();
    }

    public async Task InvalidateAllUserTokensAsync(Guid userId)
    {
        // Ejecuta un UPDATE masivo en PostgreSQL para todos los tokens del usuario que aún no han sido usados
        await _context.VerificationTokens
            .Where(t => t.UserId == userId && t.UsedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.UsedAt, DateTimeOffset.UtcNow));
    }

    public async Task<User?> GetUserByIdAsync(Guid id) =>
    await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
}