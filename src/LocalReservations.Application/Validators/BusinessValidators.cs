using FluentValidation;
using LocalReservations.Application.DTOs;

namespace LocalReservations.Application.Validators;

public class CreateBusinessRequestValidator : AbstractValidator<CreateBusinessRequest>
{
    public CreateBusinessRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Phone).NotEmpty().Matches(@"^\+?[0-9]{8,15}$");
        RuleFor(x => x.OpenTime).NotEmpty().Matches(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$");
        RuleFor(x => x.CloseTime).NotEmpty().Matches(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$");
        RuleFor(x => x.SlotDurationMinutes).InclusiveBetween(15, 240);
    }
}

public class UpdateBusinessRequestValidator : AbstractValidator<UpdateBusinessRequest>
{
    public UpdateBusinessRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Name));
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.Address).MaximumLength(500);
        RuleFor(x => x.Phone).Matches(@"^\+?[0-9]{8,15}$").When(x => !string.IsNullOrEmpty(x.Phone));
        RuleFor(x => x.OpenTime).Matches(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$").When(x => !string.IsNullOrEmpty(x.OpenTime));
        RuleFor(x => x.CloseTime).Matches(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$").When(x => !string.IsNullOrEmpty(x.CloseTime));
        RuleFor(x => x.SlotDurationMinutes).InclusiveBetween(15, 240).When(x => x.SlotDurationMinutes > 0);
    }
}