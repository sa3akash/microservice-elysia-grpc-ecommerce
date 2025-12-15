import { status } from "@grpc/grpc-js";
import { AppError } from "@ecom/common";

export const UserError = {
  notFound: (id: string) =>
    new AppError(
      status.NOT_FOUND,
      "User not found",
      `User with id ${id} does not exist`
    ),

  alreadyExists: (email: string) =>
    new AppError(
      status.ALREADY_EXISTS,
      "User already exists",
      `User with email ${email} already exists`
    ),

  invalid: (msg: string) =>
    new AppError(
      status.INVALID_ARGUMENT,
      msg
    ),
};
