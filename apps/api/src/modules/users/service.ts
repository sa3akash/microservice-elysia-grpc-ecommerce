import { userClient } from "@/clients/users.client";
import { CreateUserRequest, GetUserRequest, User } from "@ecom/common";
import type { UserModel } from "./model";

export abstract class UserService {
  static async getUserById(id: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const request: GetUserRequest = {
        id,
      };
      userClient.getUser(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  static async createUser(body: UserModel.signUpRequestType): Promise<User> {
    return new Promise((resolve, reject) => {
      const request: CreateUserRequest = {
        name: body.name,
        email: body.email,
        password: body.password,
        phone: body.phone,
      };
      userClient.createUser(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }
}
