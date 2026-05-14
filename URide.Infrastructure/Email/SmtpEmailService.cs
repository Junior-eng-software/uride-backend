using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using URide.Application.Interfaces;

namespace URide.Infrastructure.Email;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;
    public SmtpEmailService(IConfiguration config) => _config = config;

    public async Task SendActivationEmailAsync(string toEmail, string plainToken)
    {
        var host = _config["Mailtrap:Host"];
        var port = int.Parse(_config["Mailtrap:Port"]!);
        var user = _config["Mailtrap:Username"];
        var pass = _config["Mailtrap:Password"];

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress("noreply@u-ride.com", "U-Ride Security"),
            Subject = "Activa tu cuenta de U-Ride",
            Body = $"¡Hola!\n\nTu token de activación seguro es: {plainToken}\n\nIngrésalo en la aplicación para verificar tu cuenta institucional.",
            IsBodyHtml = false
        };
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }
    public async Task SendPasswordResetEmailAsync(string toEmail, string plainToken)
    {
        var host = _config["Mailtrap:Host"];
        var port = int.Parse(_config["Mailtrap:Port"]!);
        var user = _config["Mailtrap:Username"];
        var pass = _config["Mailtrap:Password"];

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress("noreply@u-ride.com", "U-Ride Security"),
            Subject = "Recuperación de Contraseña - U-Ride",
            Body = $"¡Hola!\n\nHemos recibido una solicitud para restablecer tu contraseña.\n\nTu token de recuperación es: {plainToken}\n\nEste token expirará en exactamente 15 minutos.\n\nSi no solicitaste este cambio, ignora este correo.",
            IsBodyHtml = false
        };
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }
}