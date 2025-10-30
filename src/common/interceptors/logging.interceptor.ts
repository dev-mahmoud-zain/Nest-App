import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const date = new Date();
    const now = Date.now();

    const longRequests = ["/brands/update-brand","/categories/create-category","/products/create","/products/update"];
    const isLongRequest = longRequests.some(path => req.path.startsWith(path));

    let statusCode = res.statusCode;
    let errorName: string | null = null;

    const log = () => {
      console.log(
        `${req.method} ${req.path} ${statusCode} ${Date.now() - now}ms AT: ${date.toLocaleString()}${errorName ? ` [${errorName}]` : ''}`
      );
    };

    if (isLongRequest) {
      return next
        .handle()
        .pipe(finalize(log));
    }

    return next
      .handle()
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            statusCode = 408;
            errorName = 'RequestTimeoutException';
            return throwError(() => new RequestTimeoutException());
          }

          statusCode = err?.status || 500;
          errorName = err?.name || 'UnknownError';
          return throwError(() => err);
        }),
        finalize(log)
      );
  }
}
