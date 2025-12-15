import { UserErrors } from "@/errors/user.errors";
import { handleGrpcError } from "@/grpc/grpc-handler";
import { UserRepository } from "@/repository/user.repository";
import type { UserRole } from "@/utils/schema";
import type {
  GetUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  User,
  UserServiceServer,
  CreateUserRequest,
  GetUsersRequest,
  GetUsersResponse,
} from "@ecom/common";
import {
  Metadata,
  status,
  type handleUnaryCall,
  type sendUnaryData,
  type ServerUnaryCall,
  type ServiceError,
} from "@grpc/grpc-js";

export class UsersService implements UserServiceServer {
  [name: string]: any;

  async getUser(
    call: ServerUnaryCall<GetUserRequest, User>,
    callback: sendUnaryData<User>
  ) {
    try {
      const { id } = call.request;

      if (!id) {
        throw UserErrors.invalidArgument("User ID is required");
      }

      const user = (await UserRepository.getUserById(id)) as unknown as User;
      if (!user) {
        throw UserErrors.notFound(id);
      }

      callback(null, user);
    } catch (error) {
      handleGrpcError(error, callback);
    }
  }

  createUser: handleUnaryCall<CreateUserRequest, User> = async (
    call,
    callback
  ) => {
    try {
      const { name, email, password, phone } = call.request;

      if (!name || !email || !password || !phone) {
        throw UserErrors.invalidArgument("All fields are required");
      }

      if (await UserRepository.getUserByEmail(email)) {
        throw UserErrors.alreadyExists(email);
      }

      const user = await UserRepository.createUser({
        name,
        email,
        password,
        phone,
      }) as unknown as User;

      callback(null, user);
    } catch (error) {
      handleGrpcError(error, callback);
    }
  };

  updateUser: handleUnaryCall<UpdateUserRequest, User> = async (
    call,
    callback
  ) => {
    try {
      const { id, name, email, password, avatar, phone, preferences } =
        call.request;

      if (!id) {
        throw UserErrors.invalidArgument("All fields are required");

      }

      const existingUser = await UserRepository.getUserById(id);
      if (!existingUser) {
        throw UserErrors.notFound(id);
      }

      if (email && email !== existingUser.email) {
        const emailCheck = await UserRepository.getUserByEmail(email);
        if (emailCheck) {
          throw UserErrors.alreadyExists(email);
        }
      }

      const updatedUser = await UserRepository.updateUser(id, {
        name,
        email,
        password,
        avatar,
        phone,
        preferences,
      }) as unknown as User;

      if (!updatedUser) {
        throw UserErrors.internal();
      }

      callback(null, updatedUser);
    } catch (error) {
      handleGrpcError(error, callback);
    }
  };

  deleteUser: handleUnaryCall<DeleteUserRequest, User> = async (
    call,
    callback
  ) => {
    try {
      const { id } = call.request;

      if (!id) {
        throw UserErrors.invalidArgument("User ID is required");
      }

      const existingUser = await UserRepository.getUserById(id);
      if (!existingUser) {
        throw UserErrors.notFound(id);
      }

      const deletedUser = await UserRepository.deleteUser(id);

      callback(null, deletedUser as unknown as User);
    } catch (error) {
      handleGrpcError(error, callback);
    }
  };

  getUsers: handleUnaryCall<GetUsersRequest, GetUsersResponse> = async (
    call,
    callback
  ) => {
    try {
      const users = await UserRepository.getUsers(
        call.request.limit || 10,
        call.request.offset || 0,
        call.request.role as UserRole
      );
      callback(null, users as unknown as GetUsersResponse);
    } catch (error) {
      handleGrpcError(error, callback);
    }
  };
}
