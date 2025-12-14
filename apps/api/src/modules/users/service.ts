import { client } from "@/clients/users.client";
import { GetUserRequest, User } from "@ecom/common";

export abstract class UserService {
  static async getUserById(id: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const request: GetUserRequest = {
        id,
      };
      client.getUser(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }
}
