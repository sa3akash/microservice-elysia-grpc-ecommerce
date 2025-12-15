import { UserError } from "@/errors/user.errors";
import { UserRepository } from "@/repository/user.repository";
import type { UserRole } from "@/utils/schema";
import {
  createUserSchema,
  deleteUserSchema,
  getUserSchema,
  getUsersSchema,
  updateUserSchema,
} from "@/utils/user.validation";
import {
  type GetUserRequest,
  type UpdateUserRequest,
  type DeleteUserRequest,
  type User,
  type UserServiceServer,
  type CreateUserRequest,
  type GetUsersRequest,
  type GetUsersResponse,
  validate,
} from "@ecom/common";
import { type handleUnaryCall } from "@grpc/grpc-js";

export class UsersService implements UserServiceServer {
  [name: string]: any;

  getUser: handleUnaryCall<GetUserRequest, User> = async (call, callback) => {
    const data = validate<GetUserRequest>(getUserSchema, call.request);

    if (!data.id) {
      throw UserError.invalid("User ID is required");
    }
    const user = (await UserRepository.getUserById(data.id)) as unknown as User;
    if (!user) {
      throw UserError.notFound(data.id);
    }

    callback(null, user);
  };

  createUser: handleUnaryCall<CreateUserRequest, User> = async (
    call,
    callback
  ) => {
    const data = validate<CreateUserRequest>(createUserSchema, call.request);

    if (!data.name || !data.email || !data.password || !data.phone) {
      throw UserError.invalid("All fields are required");
    }

    if (await UserRepository.getUserByEmail(data.email)) {
      throw UserError.alreadyExists(data.email);
    }

    const user = (await UserRepository.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
    })) as unknown as User;

    callback(null, user);
  };

  updateUser: handleUnaryCall<UpdateUserRequest, User> = async (
    call,
    callback
  ) => {
    const data = validate<UpdateUserRequest>(updateUserSchema, call.request);

    if (!data.id) {
      throw UserError.invalid("User ID is required");
    }

    const existingUser = await UserRepository.getUserById(data.id);
    if (!existingUser) {
      throw UserError.notFound(data.id);
    }

    if (data.email && data.email !== existingUser.email) {
      const emailCheck = await UserRepository.getUserByEmail(data.email);
      if (emailCheck) {
        throw UserError.alreadyExists(data.email);
      }
    }

    const updatedUser = (await UserRepository.updateUser(data.id, {
      name: data.name,
      email: data.email,
      password: data.password,
      avatar: data.avatar,
      phone: data.phone,
      preferences: data.preferences,
    })) as unknown as User;

    if (!updatedUser) {
      throw UserError.notFound(data.id);
    }

    callback(null, updatedUser);
  };

  deleteUser: handleUnaryCall<DeleteUserRequest, User> = async (
    call,
    callback
  ) => {
    const data = validate<DeleteUserRequest>(deleteUserSchema, call.request);

    if (!data.id) {
      throw UserError.invalid("User ID is required");
    }

    const existingUser = await UserRepository.getUserById(data.id);
    if (!existingUser) {
      throw UserError.notFound(data.id);
    }

    const deletedUser = await UserRepository.deleteUser(data.id);

    callback(null, deletedUser as unknown as User);
  };

  getUsers: handleUnaryCall<GetUsersRequest, GetUsersResponse> = async (
    call,
    callback
  ) => {
    const data = validate<GetUsersRequest>(getUsersSchema, call.request);
    const users = await UserRepository.getUsers(
      data.limit || 10,
      data.offset || 0,
      data.role as UserRole
    );
    callback(null, users as unknown as GetUsersResponse);
  };
}
