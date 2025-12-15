import { status, Metadata, type ServiceError } from "@grpc/grpc-js";

export class GrpcError extends Error {
  constructor(
    public readonly code: status,
    message: string,
    public readonly details?: string,
    public readonly metadata?: Metadata
  ) {
    super(message);
  }

  toServiceError(): ServiceError {
    return {
      name: status[this.code],
      message: this.message,
      code: this.code,
      details: this.details ?? this.message,
      metadata: this.metadata ?? new Metadata(),
    };
  }
}
