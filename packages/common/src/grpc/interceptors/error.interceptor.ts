import { Metadata, status } from "@grpc/grpc-js";
import { logger } from "../../utils";
import type {
  GrpcServerInterceptor,
  GrpcCall,
  GrpcCallback,
  GrpcHandler,
} from "./server-utils";
import { AppError } from "..";

export class ErrorInterceptor implements GrpcServerInterceptor {
  async intercept(
    call: GrpcCall,
    callback: GrpcCallback,
    next: GrpcHandler,
    _context: any
  ): Promise<void> {
    try {
      await next(call, callback);
    } catch (err: any) {
      logger.error(`[ErrorInterceptor] Uncaught exception: ${err.message}`, {
        stack: err.stack,
      });

      if (err instanceof AppError) {
        return callback(err.toServiceError(), null);
      }

      callback(
        {
          name: "INTERNAL_ERROR",
          code: status.INTERNAL,
          message: "Internal Server Error",
          metadata: new Metadata(),
        },
        null
      );
    }
  }
}
