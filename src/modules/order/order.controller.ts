import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  Delete,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RoleEnum, SetAccessRoles, SetTokenType } from 'src/common';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import type { IRequest, IUser } from 'src/common';
import { Types } from 'mongoose';
import { CheckOutParamDto } from './dto/checkout.dto';
import type { Request } from 'express';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('create')
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: IRequest) {
    return this.orderService.createOrder(
      createOrderDto,
      req.credentials?.user._id as Types.ObjectId,
    );
  }

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('checkout/:orderId')
  check(@Req() req: IRequest, @Param() param: CheckOutParamDto) {
    return this.orderService.checkout(
      param.orderId,
      req.credentials?.user as IUser,
    );
  }

  @Post('webhook')
  webhook(@Req() req: Request) {
    return this.orderService.webhook(req);
  }

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('cancel/:orderId')
  cancelOrder(@Req() req: IRequest, @Param() param: CheckOutParamDto) {
     return this.orderService.cancelOrder(
      param.orderId,
      req.credentials?.user._id as Types.ObjectId,
    );
  }
}