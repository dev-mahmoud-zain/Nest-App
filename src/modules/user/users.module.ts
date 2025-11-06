import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { TokenModel, TokenRepository, UserModel, UserRepository } from "src/DATABASE";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "src/common/services/token.service";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [TokenModel, UserModel, TokenModel,],
    exports: [
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        JwtService,
        TokenService,
        UserRepository,
        TokenRepository,
        AuthModule,
    ]
})
export class userModule { }