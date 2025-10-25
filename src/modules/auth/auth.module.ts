import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { OTP_Repository, TokenModel, TokenRepository, UserModel, UserRepository } from "src/DATABASE";
import { OTP_Model } from "src/DATABASE/models/otp.model";
import { TokenService } from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";

@Module({
    imports: [UserModel, OTP_Model, TokenModel],
    exports: [UserRepository,
        UsersService,
        OTP_Repository,
        TokenRepository,
        TokenService,
        JwtService],
    controllers: [AuthController],
    providers: [
        AuthService,
        UserRepository,
        UsersService,
        OTP_Repository,
        TokenRepository,
        TokenService,
        JwtService]
})
export class AuthModule {
}