export const customGraphqlError = (error: any) => {
  const originalError = error?.originalError;

  if (originalError && typeof originalError.code === "number") {
    const isUnavailable = originalError.code === 14;

    return {
      message: isUnavailable
        ? "Service Unavailable. Please try again later."
        : originalError.metadata?.get?.("message")?.[0] ||
          originalError.details,
      code: isUnavailable ? "SERVICE_UNAVAILABLE" : "GRPC_ERROR",
    };
  }
  return {
    message: error.message,
    code: error.code,
  };
};
