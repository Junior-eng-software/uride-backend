using System.ComponentModel.DataAnnotations;

namespace URide.Application.DTOs;

public class ResetPasswordRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;

    // Validamos desde la entrada que la nueva clave tenga al menos 8 caracteres
    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}