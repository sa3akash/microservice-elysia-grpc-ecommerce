import { status } from "@grpc/grpc-js";
import { GrpcError } from "@/grpc/grpc-error";

export const UserErrors = {
  notFound: (id: string) =>
    new GrpcError(
      status.NOT_FOUND,
      "User not found",
      `User with id ${id} does not exist`
    ),

  alreadyExists: (email: string) =>
    new GrpcError(
      status.ALREADY_EXISTS,
      "User already exists",
      `User with email ${email} already exists`
    ),

  invalidArgument: (message: string) =>
    new GrpcError(status.INVALID_ARGUMENT, message),

  internal: (err?: unknown) =>
    new GrpcError(
      status.INTERNAL,
      "Internal server error",
      err instanceof Error ? err.message : undefined
    ),
};
