using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using LocalReservations.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace LocalReservations.Application.Services;

public class WhatsAppService : IWhatsAppService
{
    private readonly HttpClient _httpClient;
    private readonly string _instanceName;
    private readonly ILogger<WhatsAppService> _logger;
    private static readonly SemaphoreSlim _semaphore = new(1, 1);
    private const int MaxRetries = 3;
    private const int RetryDelayMs = 2000;

    public WhatsAppService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<WhatsAppService> logger)
    {
        _httpClient = httpClient;
        _instanceName = configuration["EvolutionApi:InstanceName"] ?? "localreservations";
        _logger = logger;

        var apiKey = configuration["EvolutionApi:ApiKey"];
        if (!string.IsNullOrEmpty(apiKey))
        {
            _httpClient.DefaultRequestHeaders.Remove("apikey");
            _httpClient.DefaultRequestHeaders.Add("apikey", apiKey);
        }
    }

    public async Task<bool> SendMessageAsync(string phoneNumber, string text)
    {
        var formattedPhone = FormatPhoneNumber(phoneNumber);
        if (string.IsNullOrEmpty(formattedPhone))
        {
            _logger.LogWarning("Invalid phone number format: {Phone}", phoneNumber);
            return false;
        }

        for (int attempt = 1; attempt <= MaxRetries; attempt++)
        {
            try
            {
                await _semaphore.WaitAsync();
                try
                {
                    var payload = new
                    {
                        number = formattedPhone,
                        text = text
                    };

                    var baseUrl = "http://localhost:8080";
                    var url = $"{baseUrl}/message/sendText/{_instanceName}";

                    var jsonContent = new StringContent(
                        JsonSerializer.Serialize(payload),
                        Encoding.UTF8,
                        "application/json");

                    var response = await _httpClient.PostAsync(url, jsonContent);

                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("WhatsApp message sent successfully to {Phone}", formattedPhone);
                        return true;
                    }

                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning(
                        "Failed to send WhatsApp message to {Phone}. Status: {Status}. Attempt {Attempt}/{MaxRetries}. Error: {Error}",
                        formattedPhone, response.StatusCode, attempt, MaxRetries, errorContent);

                    if (attempt < MaxRetries)
                    {
                        await Task.Delay(RetryDelayMs * attempt);
                    }
                }
                finally
                {
                    _semaphore.Release();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception sending WhatsApp message to {Phone}. Attempt {Attempt}/{MaxRetries}",
                    formattedPhone, attempt, MaxRetries);

                if (attempt < MaxRetries)
                {
                    await Task.Delay(RetryDelayMs * attempt);
                }
            }
        }

        return false;
    }

    private static string FormatPhoneNumber(string phone)
    {
        if (string.IsNullOrEmpty(phone))
            return string.Empty;

        var cleaned = new string(phone.Where(c => char.IsDigit(c) || c == '+').ToArray());

        if (cleaned.StartsWith("0") && cleaned.Length == 10)
        {
            cleaned = "+593" + cleaned[1..];
        }
        else if (cleaned.StartsWith("593") && !cleaned.StartsWith("+593"))
        {
            cleaned = "+" + cleaned;
        }
        else if (!cleaned.StartsWith("+") && cleaned.Length == 12)
        {
            cleaned = "+" + cleaned;
        }

        if (!System.Text.RegularExpressions.Regex.IsMatch(cleaned, @"^\+593[0-9]{9}$"))
            return string.Empty;

        return cleaned;
    }
}
