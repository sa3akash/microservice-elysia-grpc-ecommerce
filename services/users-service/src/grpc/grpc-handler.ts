import type { sendUnaryData } from "@grpc/grpc-js";
import { GrpcError } from "./grpc-error";
import { status, Metadata } from "@grpc/grpc-js";

export function handleGrpcError(error: unknown, callback: sendUnaryData<any>) {
  if (error instanceof GrpcError) {
    return callback(error.toServiceError(), null);
  }

  // fallback
  callback(
    {
      name: "Internal",
      message: "Internal server error",
      code: status.INTERNAL,
      details: error instanceof Error ? error.message : "Unknown error",
      metadata: new Metadata(),
    },
    null
  );
}
