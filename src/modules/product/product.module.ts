import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { BrandModel, CategoryModel, ProductModel, TokenModel, TokenRepository, UserModel, UserRepository } from 'src/DATABASE';
import { TokenService } from 'src/common/services/token.service';
import { UsersService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { ProductRepository } from 'src/DATABASE/repository/product.repository';
import { BrandRepository } from 'src/DATABASE/repository/brand.repository';
import { CategoryRepository } from 'src/DATABASE/repository/category.repository';
import { AppHelper } from 'src/common/app-helper';

@Module({
  imports: [
    UserModel,
    TokenModel,
    ProductModel,
    CategoryModel,
    BrandModel,
  ],

  controllers: [ProductController],
  
  providers: [ProductService,
    UserRepository,
    TokenRepository,
    TokenService,
    UsersService,
    JwtService,
    ProductRepository,
    BrandRepository,
    CategoryRepository,
    AppHelper,
  ],

})
export class ProductModule { }
