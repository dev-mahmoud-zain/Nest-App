import { Module } from '@nestjs/common';
import { RealTimeGateWay } from './gateway';
import { TokenService } from 'src/common';
import { JwtService } from '@nestjs/jwt';
import {
  TokenModel,
  TokenRepository,
  UserModel,
  UserRepository,
} from 'src/DATABASE';

@Module({
  imports: [UserModel, TokenModel],
  providers: [
    RealTimeGateWay,
    TokenService,
    JwtService,
    UserRepository,
    TokenRepository,
  ],
})
export class RealTimeModule {}
