using URide.Domain.Entities;

namespace URide.Application.Interfaces;

public interface IAuthRepository
{
    Task<bool> EmailExistsAsync(string email);
    Task CreateUserWithTokenAsync(User user, VerificationToken token);

    // Extrae el token y hace un JOIN (Include) con el usuario dueño de ese token
    Task<VerificationToken?> GetTokenWithUserAsync(string tokenHash, string type);

    // Actualiza ambas tablas en una sola transacción
    Task UpdateUserAndTokenAsync(User user, VerificationToken? token); // <-- Aquí el cambio

    //
    Task<User?> GetUserByEmailAsync(string email);

    Task CreateTokenAsync(VerificationToken token);
    Task InvalidateAllUserTokensAsync(Guid userId);
    Task<User?> GetUserByIdAsync(Guid id);

}

