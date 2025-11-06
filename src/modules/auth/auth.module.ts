import { Module } from '@nestjs/common';
import {
  OTP_Model,
  OTP_Repository,
  TokenModel,
  TokenRepository,
  UserModel,
  UserRepository,
} from 'src/DATABASE';
import { UsersService } from '../user/users.service';
import { TokenService } from 'src/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModel, OTP_Model, TokenModel],
  exports: [
    UserRepository,
    UsersService,
    OTP_Repository,
    TokenRepository,
    TokenService,
    JwtService,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    UsersService,
    OTP_Repository,
    TokenRepository,
    TokenService,
    JwtService,
  ],
})
export class AuthModule {}
