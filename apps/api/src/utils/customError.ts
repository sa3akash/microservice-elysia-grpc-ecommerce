import type { Context } from "elysia";

// 1. Map gRPC Status Codes to HTTP Status Codes
export const grpcToHttpStatus: Record<number, number> = {
  0: 200, // OK
  1: 499, // CANCELLED
  2: 500, // UNKNOWN
  3: 400, // INVALID_ARGUMENT
  4: 504, // DEADLINE_EXCEEDED
  5: 404, // NOT_FOUND
  6: 409, // ALREADY_EXISTS
  7: 403, // PERMISSION_DENIED
  8: 429, // RESOURCE_EXHAUSTED
  9: 400, // FAILED_PRECONDITION
  10: 409, // ABORTED
  11: 400, // OUT_OF_RANGE
  12: 501, // UNIMPLEMENTED
  13: 500, // INTERNAL
  14: 503, // UNAVAILABLE
  15: 500, // DATA_LOSS
  16: 401, // UNAUTHENTICATED
};

export class GatewayError extends Error {
  constructor(
    message: string,
    public status = 500,
    public code = "GATEWAY_ERROR"
  ) {
    super(message);
  }
}


export const errorHandler = ({
  code,
  error,
  set,
}: {
  code: any;
  error: any;
  set: Context["set"];
}) => {
  
  // ---------- App Error ----------
  if (error instanceof GatewayError) {
    set.status = error.status;
    return {
      success: false,
      message: error.message,
      code: error.code,
    };
  }  
  

  
  /* ---------------- GraphQL ---------------- */


  // ---------- Validation ----------
  if (code === "VALIDATION") {
    set.status = 400;
    return {
      success: false,
      message: error.message ?? "Validation failed",
      code: "VALIDATION_ERROR",
    };
  }

  // Format the GraphQL error the way you like
  if (code === "INTERNAL_SERVER_ERROR") {
    set.status = 200;
    return {
      errors: [{ message: error.message, extensions: { code: "INTERNAL" } }],
      data: null,
    };
  }

  // ---------- gRPC ----------
  if (typeof (error as any)?.code === "number") {
    const grpcCode = (error as any).code;
    set.status = grpcToHttpStatus[grpcCode] ?? 500;
    return grpcError(error);
  }

  // ---------- Unknown ----------
  set.status = 500;
  return {
    success: false,
    message: error?.message ?? "Internal Server Error",
    code: "INTERNAL_ERROR",
  };
};

const grpcError = (error: any) => {
  const grpcCode = error?.code;
  const message =
    grpcCode === 14
      ? "Service Unavailable. Please try again later."
      : error.metadata?.get("message")?.[0] ?? error.message ?? "RPC Error";

  return {
    success: false,
    message: message,
    code: grpcCode === 14 ? "SERVICE_UNAVAILABLE" : "GRPC_ERROR",
  };
};
