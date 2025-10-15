import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const port = process.env.PORT ?? 5000;


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{logger:['error', 'warn']});
  await app.listen(port, () => {
    console.log("==================================");
    console.log(`Server Is Running On Port :: ${port}`);
    console.log("==================================");

  });
}
bootstrap();