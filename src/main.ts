import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as express from "express"
import path from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
const port = process.env.PORT ?? 5000;

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

  app.enableCors();

  app.use("/order/webhook",express.raw({type:"application/json"}));

  app.useGlobalInterceptors(new LoggingInterceptor, new ResponseInterceptor)

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.use("/uploads", express.static(path.resolve("./uploads")))

  await app.listen(port, () => {
    console.log("==================================");
    console.log(`Server Is Running On Port :: ${port}`);
    console.log("==================================");
  });
}
bootstrap();


