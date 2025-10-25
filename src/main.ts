import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as express from "express"
import path from 'node:path';
const port = process.env.PORT ?? 5000;


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  app.useGlobalInterceptors(new LoggingInterceptor)


  app.use("/uploads", express.static(path.resolve("./uploads")))
  
  await app.listen(port, () => {
    console.log("==================================");
    console.log(`Server Is Running On Port :: ${port}`);
    console.log("==================================");
  });
}
bootstrap();