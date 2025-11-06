import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import {
  CartRepository,
  ProductModel,
  ProductRepository,
  TokenModel,
  TokenRepository,
  UserModel,
  UserRepository,
  CartModel,
  BrandRepository,
  CategoryRepository,
  BrandModel,
  CategoryModel
} from 'src/DATABASE';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { AppHelper } from 'src/common/app-helper';

@Module({
  imports: [TokenModel, UserModel, ProductModel,CartModel,BrandModel,CategoryModel],
  controllers: [CartController],
  providers: [
    CartService, 
    TokenRepository,
     TokenService,
     JwtService,
     UserRepository,
     ProductRepository,
    CartRepository,
    AppHelper,
    BrandRepository,
    CategoryRepository
  ],
})
export class CartModule { }
