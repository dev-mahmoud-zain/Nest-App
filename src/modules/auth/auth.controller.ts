import { Body, Controller, Injectable, Post, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { confirmEmailDto, loginDto, reSendOTPDto, signUpDto, signUpWithGmailDto } from "./dto";
import { delay, of } from "rxjs";


@Injectable()
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post("signup")
    async signUp(@Body(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    })) body: signUpDto) {

        const state = await this.authService.signup(body);

        return {
            message: "Sign Up Success",
            info: state
        }
    }

    @Post("confirm-email")
    async confirmEmail(@Body(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    })) body: confirmEmailDto) {

        const state = await this.authService.confirmEmail(body);

        return {
            message: "Done",
            info: state
        }
    }


    @Post("re-send-confirm-email-otp")
    async resendConfirmEmailOTP(@Body(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    })) body: reSendOTPDto) {

        const state = await this.authService.resendConfirmEmailOTP(body);

        return {
            message: "Done",
            info: state
        }
    }


    @Post("login")
    async login(@Body(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    })) body: loginDto) {

        const credentials = await this.authService.login(body);

        return{
            message: "Login Success",
            credentials
        }
    }

    @Post("login-with-gmail")
    async loginWithGmail(
        @Body(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true
        })) body: signUpWithGmailDto
    ) {

        const credentials = await this.authService.loginWithGmail(body);

        return {
            message: "Login Success",
            credentials
        }

    }

}