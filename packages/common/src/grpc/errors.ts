import { Metadata, status, type ServiceError } from "@grpc/grpc-js";

export class AppError extends Error {
  constructor(
    public grpcCode: status,
    message: string,
    public details?: string
  ) {
    super(message);
  }

  toServiceError(): ServiceError {
    const metadata = new Metadata();
    metadata.set("message", this.message);

    return {
      name: "GrpcError",
      code: this.grpcCode,
      message: this.message,
      details: this.details ?? "",
      metadata,
    };
  }
}
