using Microsoft.Extensions.Configuration;
using URide.Application.DTOs;
using URide.Application.Interfaces;
using URide.Domain.Entities;

namespace URide.Application.Services;

public class UserService : IUserService
{
    // [CRÍTICO] Declaramos los campos privados para que la clase los reconozca
    private readonly IAuthRepository _authRepo;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;

    // [CRÍTICO] Inyectamos las dependencias en el constructor
    public UserService(IAuthRepository authRepo, IEmailService emailService, IConfiguration config)
    {
        _authRepo = authRepo;
        _emailService = emailService;
        _config = config;
    }

    public async Task<(bool Success, int StatusCode, string Message, UserProfileResponse? Data)> GetProfileAsync(Guid userId)
    {
        var user = await _authRepo.GetUserByIdAsync(userId);

        if (user == null)
            return (false, 404, "Usuario no encontrado.", null);

        var profile = new UserProfileResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            IsVerified = user.IsVerified
        };

        return (true, 200, "Perfil recuperado.", profile);
    }

    public async Task<(bool Success, int StatusCode, string Message)> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _authRepo.GetUserByIdAsync(userId);
        if (user == null) return (false, 404, "Usuario no encontrado.");

        bool emailChanged = user.Email != request.Email;

        if (emailChanged)
        {
            var allowedDomain = _config["AllowedDomain"];
            if (string.IsNullOrEmpty(allowedDomain) || !request.Email.EndsWith(allowedDomain, StringComparison.OrdinalIgnoreCase))
                return (false, 422, $"El nuevo correo debe pertenecer al dominio institucional ({allowedDomain}).");

            user.IsVerified = false;
            user.Email = request.Email;

            var plainToken = Guid.NewGuid().ToString("N");

            // Generamos el hash SHA-256 para el nuevo token de activación
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var hashBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(plainToken));
            var tokenHash = Convert.ToBase64String(hashBytes);

            var verificationToken = new VerificationToken
            {
                User = user,
                TokenHash = tokenHash,
                Type = "ACCOUNT",
                ExpiresAt = DateTimeOffset.UtcNow.AddHours(24)
            };

            // Guardamos el token y enviamos el correo
            await _authRepo.CreateTokenAsync(verificationToken);
            await _emailService.SendActivationEmailAsync(user.Email, plainToken);
        }

        user.FullName = request.FullName;
        user.Phone = request.Phone;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        // Persistimos los cambios
        await _authRepo.UpdateUserAndTokenAsync(user, null!);

        if (emailChanged)
            return (true, 200, "Perfil actualizado. Como cambiaste tu correo, tu cuenta ahora requiere re-verificación. Revisa tu nueva bandeja de entrada.");

        return (true, 200, "Perfil actualizado exitosamente.");
    }
}