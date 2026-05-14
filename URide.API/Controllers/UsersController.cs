using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using URide.Application.DTOs;
using URide.Application.Interfaces;

namespace URide.API.Controllers;

[Authorize] // [CRÍTICO] T-5.1: Este atributo es el escudo. Bloquea peticiones sin JWT válido.
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        // El framework extrae automáticamente los Claims del JWT que envió el cliente.
        // Buscamos el ID del usuario (Sub) que guardamos en el token cuando hizo Login.
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdString, out Guid userId))
            return Unauthorized(new { message = "Token inválido." });

        var result = await _userService.GetProfileAsync(userId);

        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Data);
    }


    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out Guid userId))
            return Unauthorized(new { message = "Token inválido." });

        var result = await _userService.UpdateProfileAsync(userId, request);

        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(new { message = result.Message });
    }
}