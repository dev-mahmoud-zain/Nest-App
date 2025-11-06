import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartCartParamDto } from './dto/create-cart.dto';
import { RoleEnum, SetAccessRoles, SetTokenType } from 'src/common';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import type { IRequest } from 'src/common';
import { Types } from 'mongoose';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';





@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  })
)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }


  // ================== Add To Cart ================== 


  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post("add/:productId/:quantity")
  addToCart(
    @Req() req: IRequest,
    @Param() param: AddToCartCartParamDto
  ) {
    return this.cartService.addToCart(param, req.credentials?.user._id as Types.ObjectId);
  }


  // ================== Remove From Cart ================== 


  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete("remove")
  removeFromCart(
    @Req() req: IRequest,
    @Body() removeFromCartDto: RemoveFromCartDto
  ) {
    return this.cartService.removeFromCart(removeFromCartDto, req.credentials?.user._id as Types.ObjectId);
  }

  // ================== Clear Cart ================== 


  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete("clear")
  clearCart(
    @Req() req: IRequest,
  ) {
    return this.cartService.clearCart(req.credentials?.user._id as Types.ObjectId);
  };


  // ================== Get Cart ================== 


  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get()
  getCart(
    @Req() req: IRequest,
  ) {
    return this.cartService.getCart(req.credentials?.user._id as Types.ObjectId);
  };
}