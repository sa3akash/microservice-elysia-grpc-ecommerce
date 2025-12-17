import { userClient } from "@/clients/users.client";
import { CreateUserRequest, GetUserRequest, User, UpdateUserRequest, DeleteUserRequest } from "@ecom/common";
import type { UserModel } from "./users.model";

import { Metadata } from "@grpc/grpc-js";

export interface ServiceContext {
  token?: string;
  userId?: string;
}

export abstract class UserService {
  static async getUserById(id: string, context: ServiceContext = {}): Promise<User> {
    return new Promise((resolve, reject) => {
      const request: GetUserRequest = { id };
      const metadata = new Metadata();
      if (context.token) metadata.add("x-service-token", context.token);
      if (context.userId) metadata.add("x-user-id", context.userId);

      userClient.getUser(request, metadata, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  static async createUser(body: UserModel.SignUpRequestType, context: ServiceContext = {}): Promise<User> {
    return new Promise((resolve, reject) => {
      const request = {
        name: body.name,
        email: body.email,
        password: body.password,
        phone: body.phone,
      } as CreateUserRequest;
      const metadata = new Metadata();
      // Registration typically doesn't have a token yet, but if it did (e.g. admin creating user):
      if (context.token) metadata.add("x-service-token", context.token);

      userClient.createUser(request, metadata, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  static async updateUser(
    id: string,
    body: UserModel.updateUserRequestType,
    context: ServiceContext = {}
  ) {
    return new Promise((resolve, reject) => {
      const request = {
        id,
        ...body
      } as UpdateUserRequest;
      const metadata = new Metadata();
      if (context.token) metadata.add("x-service-token", context.token);
      if (context.userId) metadata.add("x-user-id", context.userId);

      userClient.updateUser(request, metadata, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  static async deleteUser(id: string, context: ServiceContext = {}) {
    return new Promise((resolve, reject) => {
      const request: DeleteUserRequest = { id };
      const metadata = new Metadata();
      if (context.token) metadata.add("x-service-token", context.token);
      if (context.userId) metadata.add("x-user-id", context.userId);

      userClient.deleteUser(request, metadata, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  static async getUsers(
    query: { limit?: number; offset?: number; role?: string },
    context: ServiceContext = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        limit: query.limit || 10,
        offset: query.offset || 0,
        role: query.role || "",
      };
      const metadata = new Metadata();
      if (context.token) metadata.add("x-service-token", context.token);
      if (context.userId) metadata.add("x-user-id", context.userId);

      userClient.getUsers(request, metadata, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }
}
