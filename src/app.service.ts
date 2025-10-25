import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {


  getHello(): {
    message: string,
    info: string
  } {
    return {
      message: 'Welcome to the E-Commerce Application',
      info: 'This project marks my first experience developing with NestJS.'
    };
  }




}
