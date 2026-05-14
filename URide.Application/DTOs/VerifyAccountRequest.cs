using System.ComponentModel.DataAnnotations;

namespace URide.Application.DTOs;

public class VerifyAccountRequest
{
    // Solo pedimos el token plano que llegó por correo.
    [Required]
    public string Token { get; set; } = string.Empty;
}