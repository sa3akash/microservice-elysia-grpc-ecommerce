import type {
  GetUserRequest,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  User,
  UserServiceServer,
} from "@ecom/common";
import {
  Metadata,
  status,
  type sendUnaryData,
  type ServerUnaryCall,
  type ServiceError,
} from "@grpc/grpc-js";

export class UsersService implements UserServiceServer {
  [name: string]: any;
  getUser(
    call: ServerUnaryCall<GetUserRequest, User>,
    callback: sendUnaryData<User>
  ) {
    const userId = call.request.id;
    const user = {
      id: userId,
      name: "shakil",
      email: "shakil@gmail.com",
      password: "123456",
    };

    if (!user) {
      const error: ServiceError = {
        name: "User Missing",
        message: `User with ID ${userId} does not exist.`,
        code: status.NOT_FOUND,
        metadata: new Metadata(),
        details: `User with ID ${userId} does not exist.`,
      };
      callback(error, null);
      return;
    }

    console.log(`getUser: returning ${user.name} (id: ${user.id}).`);
    callback(null, user);
  }

  createUser(
    call: ServerUnaryCall<CreateUserRequest, User>,
    callback: sendUnaryData<User>
  ) {
    const { name, email, password } = call.request;
    const user: User = {
      id: "generated-id",
      name,
      email,
      password,
    };
    console.log(`createUser: created ${user.name}`);
    callback(null, user);
  }

  updateUser(
    call: ServerUnaryCall<UpdateUserRequest, User>,
    callback: sendUnaryData<User>
  ) {
    const { id, name, email, password } = call.request;
    const user: User = {
      id,
      name,
      email,
      password,
    };
    console.log(`updateUser: updated ${user.name} (id: ${user.id})`);
    callback(null, user);
  }

  deleteUser(
    call: ServerUnaryCall<DeleteUserRequest, User>,
    callback: sendUnaryData<User>
  ) {
    const { id } = call.request;
    // Mock deletion
    const user: User = {
      id,
      name: "Deleted User",
      email: "deleted@example.com",
      password: "",
    };
    console.log(`deleteUser: deleted user (id: ${id})`);
    callback(null, user);
  }
}
