using Microsoft.AspNetCore.Mvc;
using URide.Application.DTOs;
using URide.Application.Interfaces;

namespace URide.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.RegisterAsync(request);

        return StatusCode(result.StatusCode, new { message = result.Message });
    }

    [HttpPost("verify-account")]
    public async Task<IActionResult> VerifyAccount([FromBody] VerifyAccountRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.VerifyAccountAsync(request);

        // Si hubo un error (token usado, expirado, etc), retorna Bad Request (400)
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        // Si es exitoso, retorna 200 OK
        return Ok(new { message = result.Message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.LoginAsync(request);

        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Data); // Retorna los tokens si el login es exitoso
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.ForgotPasswordAsync(request);

        // Retornamos 200 OK siempre, respetando la regla de seguridad
        return StatusCode(result.StatusCode, new { message = result.Message });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.ResetPasswordAsync(request);

        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(new { message = result.Message });
    }

}