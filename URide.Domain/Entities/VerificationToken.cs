namespace URide.Domain.Entities;

public class VerificationToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    // [CRÍTICO] Almacenará el SHA-256 del token, nunca en plano.
    public string TokenHash { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }

    public User User { get; set; } = null!;
}