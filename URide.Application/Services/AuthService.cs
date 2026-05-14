using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using URide.Application.DTOs;
using URide.Application.Interfaces;
using URide.Domain.Entities;

namespace URide.Application.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepo;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;
    private readonly IJwtProvider _jwtProvider;

    public AuthService(IAuthRepository authRepo, IEmailService emailService, IConfiguration config, IJwtProvider jwtProvider)
    {
        _authRepo = authRepo;
        _emailService = emailService;
        _config = config;
        _jwtProvider = jwtProvider;
    }

    public async Task<(bool Success, int StatusCode, string Message)> RegisterAsync(RegisterRequest request)
    {
        // [CRÍTICO] T-2.1: Validación de dominio institucional estrictamente en el backend.
        var allowedDomain = _config["AllowedDomain"];
        if (string.IsNullOrEmpty(allowedDomain) || !request.Email.EndsWith(allowedDomain, StringComparison.OrdinalIgnoreCase))
            return (false, 422, $"El correo debe pertenecer al dominio institucional ({allowedDomain}).");

        if (await _authRepo.EmailExistsAsync(request.Email))
            return (false, 409, "El correo ya se encuentra registrado.");

        // [CRÍTICO] T-2.2: Hasheo de contraseña con BCrypt (Factor 12). Nunca en texto plano.
        var passwordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(request.Password, 12);

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            PasswordHash = passwordHash,
            IsVerified = false // DoD: Inicia como falso por defecto
        };

        // [CRÍTICO] T-2.3: Generación de token seguro y almacenamiento mediante SHA-256
        var plainToken = Guid.NewGuid().ToString("N");
        var tokenHash = ComputeSha256(plainToken);

        var verificationToken = new VerificationToken
        {
            // [CRITICO] Pasamos la referencia en memoria del objeto, no el primitivo.
            User = user,
            TokenHash = tokenHash,
            Type = "ACCOUNT",
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(24)
        };

        // Transacción atómica en el repositorio
        await _authRepo.CreateUserWithTokenAsync(user, verificationToken);

        // Envío del email utilizando el token en texto plano (el usuario lo ve, la BD solo ve el hash)
        await _emailService.SendActivationEmailAsync(user.Email, plainToken);

        return (true, 201, "Registro exitoso. Revisa tu correo institucional para activar la cuenta.");
    }

    public async Task<(bool Success, int StatusCode, string Message)> VerifyAccountAsync(VerifyAccountRequest request)
    {
        // 1. Recreamos el Hash SHA-256 porque en la BD no existe el token plano
        var tokenHash = ComputeSha256(request.Token);

        // 2. Buscamos el token en PostgreSQL
        var token = await _authRepo.GetTokenWithUserAsync(tokenHash, "ACCOUNT");

        if (token == null)
            return (false, 400, "Token inválido.");

        // [CRÍTICO] T-3.1: Rechazar tokens que ya fueron consumidos (used_at no es null)
        if (token.UsedAt.HasValue)
            return (false, 400, "Este token ya fue utilizado. Tu cuenta ya debería estar activa.");

        // [CRÍTICO] T-3.1: Rechazar tokens expirados
        if (token.ExpiresAt < DateTimeOffset.UtcNow)
            return (false, 400, "El token ha expirado. Por favor, solicita uno nuevo.");

        // 3. Modificamos el estado en memoria (Marcamos el consumo y activamos la cuenta)
        token.UsedAt = DateTimeOffset.UtcNow;
        token.User.IsVerified = true;
        token.User.UpdatedAt = DateTimeOffset.UtcNow;

        // 4. Persistimos los cambios atómicamente
        await _authRepo.UpdateUserAndTokenAsync(token.User, token);

        return (true, 200, "Cuenta institucional activada exitosamente. Ya puedes iniciar sesión.");
    }

    public async Task<(bool Success, int StatusCode, string Message, LoginResponse? Data)> LoginAsync(LoginRequest request)
    {
        var user = await _authRepo.GetUserByEmailAsync(request.Email);

        // 1. Validar existencia y credenciales (BCrypt)
        if (user == null || !BCrypt.Net.BCrypt.EnhancedVerify(request.Password, user.PasswordHash))
            return (false, 401, "Credenciales incorrectas.", null);

        // 2. [CRÍTICO] T-3.2: No permitir login si is_verified == false
        if (!user.IsVerified)
            return (false, 403, "Account not activated. Revisa tu correo institucional.", null);

        // 3. Emitir Tokens
        var accessToken = _jwtProvider.GenerateAccessToken(user);
        var refreshToken = _jwtProvider.GenerateRefreshToken();

        // (Nota de Tech Lead: En el esquema de DB actual no tenemos tabla para persistir el Refresh Token, 
        // por lo que lo emitiremos para cumplir el contrato, pero su validación profunda requeriría una tabla extra en el futuro).

        var response = new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };

        return (true, 200, "Login exitoso.", response);
    }

    public async Task<(bool Success, int StatusCode, string Message)> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _authRepo.GetUserByEmailAsync(request.Email);

        // [CRÍTICO] T-4.1: Siempre retornar 200 OK, incluso si el usuario es null.
        // Esto previene los "User Enumeration Attacks" (que un hacker use la API para adivinar qué correos existen).
        if (user == null)
            return (true, 200, "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación pronto.");

        var plainToken = Guid.NewGuid().ToString("N");
        var tokenHash = ComputeSha256(plainToken);

        var resetToken = new VerificationToken
        {
            UserId = user.Id, // El usuario ya existe, así que usamos su ID directamente
            TokenHash = tokenHash,
            Type = "PASSWORD_RESET",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(15) // [CRÍTICO] T-4.1: TTL exacto de 15 minutos
        };

        await _authRepo.CreateTokenAsync(resetToken);
        await _emailService.SendPasswordResetEmailAsync(user.Email, plainToken);

        return (true, 200, "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación pronto.");
    }

    public async Task<(bool Success, int StatusCode, string Message)> ResetPasswordAsync(ResetPasswordRequest request)
    {
        var tokenHash = ComputeSha256(request.Token);

        // Reutilizamos el método que creamos en el Día 3, pero esta vez buscando tokens tipo PASSWORD_RESET
        var token = await _authRepo.GetTokenWithUserAsync(tokenHash, "PASSWORD_RESET");

        if (token == null)
            return (false, 400, "Token inválido.");

        // [CRÍTICO] T-4.2: Validar estricta de token ya usado (used_at IS NULL)
        if (token.UsedAt.HasValue)
            return (false, 400, "Este token ya fue utilizado.");

        // [CRÍTICO] T-4.2: Validar expiración estricta (expires_at > NOW)
        if (token.ExpiresAt < DateTimeOffset.UtcNow)
            return (false, 400, "El token ha expirado. Solicita uno nuevo.");

        // [CRÍTICO] T-4.2: Invalidar TODOS los tokens activos del usuario en la base de datos (por seguridad)
        await _authRepo.InvalidateAllUserTokensAsync(token.User.Id);

        // [CRÍTICO] T-4.2: Actualizar la contraseña con BCrypt factor 12
        token.User.PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(request.NewPassword, 12);
        token.User.UpdatedAt = DateTimeOffset.UtcNow;

        // Marcamos el token actual como usado
        token.UsedAt = DateTimeOffset.UtcNow;

        // Persistimos el cambio de contraseña
        await _authRepo.UpdateUserAndTokenAsync(token.User, token);

        return (true, 200, "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva clave.");
    }

    private string ComputeSha256(string input)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}