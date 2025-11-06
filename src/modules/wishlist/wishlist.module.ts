import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { ProductModel, ProductRepository, TokenModel, TokenRepository, UserModel, UserRepository, WishlistModel } from 'src/DATABASE';
import { UsersService } from '../user/users.service';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { WishlistRepository } from 'src/DATABASE/repository/wishlist.repository';

@Module({
  imports: [
    UserModel, TokenModel, ProductModel, WishlistModel
  ],

  controllers: [WishlistController],

  providers: [WishlistService,
    UserRepository,
    UsersService,
    TokenRepository,
    TokenService,
    JwtService,
    ProductRepository,
    WishlistRepository],
})
export class WishlistModule { }
