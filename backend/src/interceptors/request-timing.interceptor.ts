import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from "@nestjs/common";
import { finalize, type Observable } from "rxjs";

type TimedRequest = {
  method: string;
  path?: string;
  url?: string;
};

@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestTimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<TimedRequest>();
    const started = performance.now();

    return next.handle().pipe(
      finalize(() => {
        const duration = Math.round(performance.now() - started);
        const path = request.path ?? request.url ?? "";
        this.logger.log(`${request.method} ${path} ${duration}ms`);
      }),
    );
  }
}
