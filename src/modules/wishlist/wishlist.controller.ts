import { Controller, Post, Req, Param, UseGuards, Delete, Get } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { addToWishlistDto } from './dto/add-to-wishlist.dto';
import { RoleEnum, SetAccessRoles, SetTokenType, type IRequest } from 'src/common';
import { Types } from 'mongoose';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) { }


  // ================== Add To Wishlist ================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post("add/:productId")
  addToWishlist(
    @Param() addToWishlistDto: addToWishlistDto,
    @Req() req: IRequest
  ) {
    return this.wishlistService.addToWishlist(
      new Types.ObjectId(addToWishlistDto.productId),
      req.credentials?.user._id as Types.ObjectId);
  }


  // ================== Remove From Wishlist ================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete("remove/:productId")
  removeFromWishlist(
    @Param() removeFromWishlistDto: RemoveFromWishlistDto,
    @Req() req: IRequest
  ) {
    return this.wishlistService.removeFromWishlist(
      new Types.ObjectId(removeFromWishlistDto.productId),
      req.credentials?.user._id as Types.ObjectId);
  }


  // ================== Get Wishlist ================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get()
  getWishlist(
    @Req() req: IRequest
  ) {
    return this.wishlistService.getWishlist(
      req.credentials?.user._id as Types.ObjectId);
  };


  // ================== Clear Wishlist ================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.user])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete("clear")
  clearWishlist(
    @Req() req: IRequest
  ) {
    return this.wishlistService.clearWishlist(
      req.credentials?.user._id as Types.ObjectId);
  };


}