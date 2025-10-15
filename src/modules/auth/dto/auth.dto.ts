import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsStrongPassword,
    Length,
    Matches,
    ValidateIf,
} from "class-validator";
import { IsMatch } from "src/common/decorators";
import { GenderEnum } from "src/common/enums";


// @Matches(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/, {
//     message: "Please enter your date of birth in DD/MM/YYYY format (e.g., 01/07/2000)."
// })
// dateOfBirth: string;

// @Matches(/^\+20(10|11|12|15)\d{8}$/, {
//     message: "Please enter a valid Egyptian phone number starting with +20 followed by a valid network code (010, 011, 012, or 015) — e.g., +201120809106."
// })
// @IsOptional()
// phone: string;

export class loginDto {

    @IsEmail({}, { message: "Please enter a valid email address (e.g., adhamzain@example.com)." })
    email: string;

    @IsStrongPassword({}, { message: 'Password is not strong enough.' })
    @IsNotEmpty({ message: 'Password is required.' })
    password: string;

}

export class signUpDto extends loginDto {
    @Matches(/^[A-Z][a-z]+ [A-Z][a-z]+$/, {
        message: ` Please enter your full name with first and last name, both starting with capital letters (e.g., Adham Zain).`
    })
    @Length(2, 52)
    userName: string;

    @IsMatch<string>(["password"])
    @ValidateIf((data: signUpDto) => {
        return Boolean(data.password)
    })
    confirmPassword: string;

    @IsEnum(GenderEnum)
    gender: GenderEnum
}

export class reSendOTPDto {
    @IsEmail({}, { message: "Please enter a valid email address (e.g., adhamzain@example.com)." })
    email: string;
}

export class confirmEmailDto extends reSendOTPDto {

    @Matches(/^\d{6}$/, { message: "Please enter a valid 6-digit numeric OTP code (e.g., 483920)." })
    OTP_Code: string

}


export class signUpWithGmailDto {
    @IsString()
    idToken :string
}