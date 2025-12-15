import { status } from "@grpc/grpc-js";
import { AppError } from "..";
import type { GrpcServerInterceptor, GrpcCall, GrpcCallback, GrpcHandler } from "./server-utils";

export class InternalInterceptor implements GrpcServerInterceptor {
  private readonly requiredApiKey = "gateway";
  private readonly requiredGatewayId = "one";

  async intercept(call: GrpcCall, callback: GrpcCallback, next: GrpcHandler, _context: any): Promise<void> {
    const apiKey = call.metadata.get("x-api-key")[0] as string;
    const gatewayId = call.metadata.get("x-gateway-id")[0] as string;

    if (apiKey !== this.requiredApiKey || gatewayId !== this.requiredGatewayId) {
       throw new AppError(status.PERMISSION_DENIED, "Access denied: Internal services only");
    }

    await next(call, callback);
  }
}
