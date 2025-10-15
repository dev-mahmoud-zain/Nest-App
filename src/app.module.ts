import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { usersModule } from './modules/users';
import { MongooseModule } from '@nestjs/mongoose';



@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: "./config/.env", isGlobal: true })
    , AuthModule
    , usersModule ,
  MongooseModule.forRoot(process.env.DB_URL as string,)],
    
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
