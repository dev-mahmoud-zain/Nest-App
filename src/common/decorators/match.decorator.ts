import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'match_between_fields', async: false })
export class MatchBetweenFields<T = any> implements ValidatorConstraintInterface {

    validate(value: T, args: ValidationArguments) {
        return value === args.object[args.constraints[0]]
    }

    defaultMessage(args: ValidationArguments) {
        return `'${args.property}' is not match with '${args.constraints[0]}'`;
    }
}

export function IsMatch<T=any>(
    constraints: string[],
    validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints,
            validator: MatchBetweenFields<T>,
        });
    };
}