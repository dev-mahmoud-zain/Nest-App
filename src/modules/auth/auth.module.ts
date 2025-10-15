import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { OTP_Repository, TokenModel, TokenRepository, UserModel, UserRepository } from "src/DATABASE";
import { OTP_Model } from "src/DATABASE/models/otp.model";
import { TokenService } from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports: [UserModel, OTP_Model, TokenModel],
    exports: [],
    controllers: [AuthController],
    providers: [AuthService, UserRepository, OTP_Repository, TokenRepository, TokenService, JwtService]
})
export class AuthModule {
}