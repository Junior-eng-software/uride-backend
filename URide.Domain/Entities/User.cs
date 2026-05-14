namespace URide.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }

    // [CRÍTICO] Almacenara el hash generado con BCrypt.
    public string PasswordHash { get; set; } = string.Empty;

    // [CRÍTICO] Control estricto de acceso institucional.
    public bool IsVerified { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<VerificationToken> VerificationTokens { get; set; } = new List<VerificationToken>();
}