namespace LocalReservations.Application.Interfaces;

public interface IWhatsAppService
{
    Task<bool> SendMessageAsync(string phoneNumber, string text);
}
