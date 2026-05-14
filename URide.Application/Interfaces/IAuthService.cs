using URide.Application.DTOs;

namespace URide.Application.Interfaces;

public interface IAuthService
{
    Task<(bool Success, int StatusCode, string Message)> RegisterAsync(RegisterRequest request);
    Task<(bool Success, int StatusCode, string Message)> VerifyAccountAsync(VerifyAccountRequest request);
    Task<(bool Success, int StatusCode, string Message, LoginResponse? Data)> LoginAsync(LoginRequest request);
    Task<(bool Success, int StatusCode, string Message)> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<(bool Success, int StatusCode, string Message)> ResetPasswordAsync(ResetPasswordRequest request);
}