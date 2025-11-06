import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { response } from '../utils'; 

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        const message = data?.message ?? 'done';
        const statusCode = data?.statusCode ?? 200;
        const body = data?.data ?? data;

        res.status(statusCode);

        return response({
          message,
          statusCode,
          data: body
        });
      })
    );
  }
}
