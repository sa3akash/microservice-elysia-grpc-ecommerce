import { authClient } from "@/clients/auth.client";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@ecom/common";
import { Metadata } from "@grpc/grpc-js";

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

  static async login(body: LoginRequest, ipAddress: string, userAgent: string) {
    const metadata = new Metadata();
    metadata.set("ip", ipAddress);
    metadata.set("agent", userAgent);

    return new Promise<LoginResponse>((resolve, reject) => {
      authClient.login(body, metadata, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }
}
