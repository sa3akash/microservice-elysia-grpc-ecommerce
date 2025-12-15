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

export class MyError extends Error {
  constructor(public override message: string, public code: number = 500) {
    super(message);
    Object.setPrototypeOf(this, MyError.prototype);
  }
}

// The handler function to be used in .onError()
export const errorHandler = ({ code, error, set }: any) => {
  // 1. Handle Custom Logic Error (MyError)
  if (error instanceof MyError) {
    set.status = error.code;
    return {
      success: false,
      message: error.message,
      errorCode: error.code || code,
    };
  }

  // 2. Handle gRPC Errors
  // Checks if it has a numeric 'code' (standard in grpc-js)
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "number"
  ) {
    const grpcCode = (error as any).code;
    const httpStatus = grpcToHttpStatus[grpcCode] || 500;

    set.status = httpStatus;

    const message = error.metadata.get("message")?.[0] as string;

    return {
      success: false,
      message: message || error.message || "RPC Error",
      errorCode: "GRPC_ERROR",
      grpcStatus: grpcCode,
    };
  }

  // 3. Handle Standard/Unknown Errors
  set.status = 500;
  return {
    success: false,
    message: error.message ?? "Internal Server Error",
    errorCode: "INTERNAL_SERVER_ERROR",
    details: null,
  };
};
