import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandRepository } from 'src/DATABASE/repository/brand.repository';
import { BrandModel, TokenModel, TokenRepository, UserModel, UserRepository } from 'src/DATABASE';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [BrandModel, TokenModel, UserModel],
  controllers: [BrandController],
  providers: [BrandService,
    BrandRepository,
    BrandModule,
    TokenService,
    JwtService,
    UserRepository,
    TokenRepository,
    ],
})
export class BrandModule { }
