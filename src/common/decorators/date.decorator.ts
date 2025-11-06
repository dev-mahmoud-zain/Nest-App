import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import dayjs from "dayjs";

@ValidatorConstraint({ name: 'isFutureOrToday', async: false })
export class IsFutureOrTodayConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (!value) return false;
    const date = dayjs(value, 'DD-MM-YYYY', true);
    if (!date.isValid()) return false;
    return date.isSame(dayjs(), 'day') || date.isAfter(dayjs(), 'day');
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be today or in the future`;
  }
}