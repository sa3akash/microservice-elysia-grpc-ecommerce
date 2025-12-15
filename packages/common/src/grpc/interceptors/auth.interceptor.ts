import { status, Metadata } from "@grpc/grpc-js";
import jwt from "jsonwebtoken";
import { AppError } from "..";
import type {
  GrpcServerInterceptor,
  GrpcCall,
  GrpcCallback,
  GrpcHandler,
  GrpcContext,
} from "./server-utils";

export class AuthInterceptor implements GrpcServerInterceptor {
  private validApiKeys: Set<string> = new Set(["gateway"]);
  private gatewayId: string = "one";
  private publicMethods: Set<string>;

  constructor(publicMethods: string[] = []) {
    this.publicMethods = new Set(publicMethods);
  }

  async intercept(
    call: GrpcCall,
    callback: GrpcCallback,
    next: GrpcHandler,
    context: GrpcContext
  ): Promise<void> {
    const isPublic = this.publicMethods.has(context.methodName);
    this.validateMetadata(call.metadata, isPublic);
    await next(call, callback);
  }

  private validateMetadata(metadata: Metadata, isPublic: boolean): void {
    const apiKey = metadata.get("x-api-key")[0] as string;
    const gatewayId = metadata.get("x-gateway-id")[0] as string;
    const serviceToken = metadata.get("x-service-token")[0] as string;

    // Validate API Gateway identity (Always required)
    if (!this.validApiKeys.has(apiKey)) {
      throw new AppError(status.INVALID_ARGUMENT, "Invalid API key");
    }

    if (gatewayId !== this.gatewayId) {
      throw new AppError(status.INVALID_ARGUMENT, "Invalid gateway identifier");
    }

    // Skip user authentication for public methods
    if (isPublic) {
      return;
    }

    // Validate service token for protected methods
    if (!serviceToken) {
      throw new AppError(status.UNAUTHENTICATED, "Missing service token");
    }

    this.authenticateAndSetUser(metadata, serviceToken);
  }

  private authenticateAndSetUser(metadata: Metadata, token: string): void {
    try {
      const secret = process.env["JWT_SECRET"] || "access_token_secret";
      const decoded = jwt.verify(token, secret) as any;

      if (decoded.id) metadata.set("x-user-id", decoded.id);
      if (decoded.email) metadata.set("x-user-email", decoded.email);
      if (decoded.role) metadata.set("x-user-role", decoded.role);
    } catch (error) {
      throw new AppError(status.UNAUTHENTICATED, "Invalid service token");
    }
  }
}
