using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace URide.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendActivationEmailAsync(string toEmail, string plainToken);
        Task SendPasswordResetEmailAsync(string toEmail, string plainToken);
    }
}
