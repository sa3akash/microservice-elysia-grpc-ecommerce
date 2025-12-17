import { authClient } from "@/clients/auth.client";
import type { SignupRequest, SignupResponse } from "@ecom/common";

export abstract class AuthService {
  static async signUp(body: SignupRequest) {
    return new Promise<SignupResponse>((resolve, reject) => {
      authClient.signup(body, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }
}
