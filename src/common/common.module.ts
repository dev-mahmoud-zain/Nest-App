import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "./services/token.service";
import { AuthenticationGuard } from "./guards/authentication/authentication.guard";
import { AuthorizationGuard } from "./guards/authorization/authorization.guard";
import { TokenRepository, UserRepository } from "src/DATABASE";

@Module({
  providers: [
    JwtService,
    TokenService,
    UserRepository,
    TokenRepository,
    AuthenticationGuard,
    AuthorizationGuard
  ],
  exports: [
    TokenService,
    AuthenticationGuard,
    AuthorizationGuard
  ]
})
export class CommonModule {}
