import { type ZodObject } from "zod";
import { AppError } from "../grpc";
import { status } from "@grpc/grpc-js";

export function validate<T>(schema: ZodObject, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues;
    const message = issues.map((iss) => `${iss.message}`);
    throw new AppError(
      status.INVALID_ARGUMENT,
      message[0] || "Validation failed",
    );
  }

  return result.data as T;
}
