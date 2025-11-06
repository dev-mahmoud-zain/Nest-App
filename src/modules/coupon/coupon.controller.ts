import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import {  RoleEnum, SetAccessRoles, SetTokenType } from 'src/common';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import type { IRequest} from 'src/common';
import { Types } from 'mongoose';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.admin,RoleEnum.super_admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post("create")
  createCoupon(
    @Body() createCouponDto: CreateCouponDto,
    @Req() req :IRequest
  ) {
    return this.couponService.createCoupon(createCouponDto,req.credentials?.user._id as Types.ObjectId);
  }
}
