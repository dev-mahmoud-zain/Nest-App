import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { userModule } from './modules/user';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { OrderModule } from './modules/order/order.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { AuthModule } from './modules/auth/auth.module';



@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: "./config/.env", isGlobal: true }),
    AuthModule,
    userModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule,
    WishlistModule,
    OrderModule,
    CouponModule,
    MongooseModule.forRoot(process.env.DB_URL as string,),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
