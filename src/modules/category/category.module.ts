import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from 'src/DATABASE/repository/category.repository';
import { BrandRepository } from 'src/DATABASE/repository/brand.repository';
import { BrandModel, CategoryModel, ProductModel, TokenModel, TokenRepository, UserModel, UserRepository } from 'src/DATABASE';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { AppHelper } from 'src/common/app-helper';
import { ProductRepository } from 'src/DATABASE/repository/product.repository';

@Module({
  imports: [CategoryModel, BrandModel, TokenModel,UserModel,ProductModel],
  controllers: [CategoryController],
  providers: [CategoryService,
    CategoryRepository,
    BrandRepository,
    TokenRepository,
    UserRepository,
    TokenService,
    JwtService,
    AppHelper,
    ProductRepository
  ],
})
export class CategoryModule { }
