using FluentValidation;
using LocalReservations.Application.DTOs;

namespace LocalReservations.Application.Validators;

public class CreateServiceRequestValidator : AbstractValidator<CreateServiceRequest>
{
    public CreateServiceRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DurationMinutes).InclusiveBetween(15, 480);
    }
}

public class UpdateServiceRequestValidator : AbstractValidator<UpdateServiceRequest>
{
    public UpdateServiceRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Name));
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0).When(x => x.Price > 0);
        RuleFor(x => x.DurationMinutes).InclusiveBetween(15, 480).When(x => x.DurationMinutes > 0);
    }
}