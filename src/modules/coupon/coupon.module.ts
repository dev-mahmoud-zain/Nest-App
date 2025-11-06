import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { TokenService } from 'src/common/services/token.service';
import { UsersService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { CouponModel, TokenModel, TokenRepository, UserModel, UserRepository } from 'src/DATABASE';
import { CouponRepository } from 'src/DATABASE/repository/coupon.repository';

@Module({
  imports:[UserModel,TokenModel,CouponModel],
  controllers: [CouponController],
  providers: [CouponService,TokenService,UsersService,JwtService,UserRepository,TokenRepository,CouponRepository],
})
export class CouponModule {}