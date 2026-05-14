using System.ComponentModel.DataAnnotations;

namespace URide.Application.DTOs;

public class RegisterRequest
{
    [Required] public string FullName { get; set; } = string.Empty;
    [Required][EmailAddress] public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    [Required][MinLength(8)] public string Password { get; set; } = string.Empty;
}