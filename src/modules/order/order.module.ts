import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { CategoryService } from '../category/category.service';
import { BrandModel, BrandRepository, CartModel, CartRepository, CategoryModel, CategoryRepository, CouponModel, CouponRepository, OrderModel, ProductModel, ProductRepository, TokenModel, TokenRepository, UserModel, UserRepository } from 'src/DATABASE';
import { AppHelper } from 'src/common/app-helper';
import { OrderRepository } from 'src/DATABASE/repository/order.repository';
import { PaymentService } from 'src/common';
import { RealTimeGateWay } from '../gateway';

@Module({
  imports:[CategoryModel, BrandModel, TokenModel,UserModel,ProductModel,CartModel,OrderModel,CouponModel],
  controllers: [OrderController],
  providers: [OrderService,
    CategoryService,
    CategoryRepository,
    BrandRepository,
    TokenRepository,
    UserRepository,
    TokenService,
    JwtService,
    AppHelper,
    CartRepository,
    ProductRepository,
    OrderRepository,
    CouponRepository,
    PaymentService,
    RealTimeGateWay
  ],
})
export class OrderModule { }
