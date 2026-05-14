using URide.Application.DTOs;

namespace URide.Application.Interfaces;

public interface IUserService
{
    Task<(bool Success, int StatusCode, string Message, UserProfileResponse? Data)> GetProfileAsync(Guid userId);
    Task<(bool Success, int StatusCode, string Message)> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
}