import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    RequestTimeoutException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        const req: Request = context.switchToHttp().getRequest();
        const res: Response = context.switchToHttp().getResponse();

        const date = new Date;
        const now = Date.now();
        
        return next
            .handle()
            .pipe(
                timeout(5000),
                catchError(err => {
                    if (err instanceof TimeoutError) {
                        return throwError(() => new RequestTimeoutException());
                    }
                    return throwError(() => err);
                }),
                tap(() => console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - now}ms AT: ${date.toLocaleString()}`)),
            );
    }
}