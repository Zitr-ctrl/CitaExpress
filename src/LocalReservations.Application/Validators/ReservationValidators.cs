using FluentValidation;
using LocalReservations.Application.DTOs;

namespace LocalReservations.Application.Validators;

public class CreateReservationRequestValidator : AbstractValidator<CreateReservationRequest>
{
    public CreateReservationRequestValidator()
    {
        RuleFor(x => x.ReservationDate).NotEmpty().GreaterThanOrEqualTo(DateTime.Today);
        RuleFor(x => x.StartTime).NotEmpty().Matches(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$");
        RuleFor(x => x.BusinessId).NotEmpty();
        RuleFor(x => x.ServiceId).NotEmpty();
    }
}