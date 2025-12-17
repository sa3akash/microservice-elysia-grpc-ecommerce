import { loginSchema, signupSchema } from "@/utils/auth.validation";
import {
  AppError,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  SessionInfo,
  validate,
  VerifyAccountRequest,
  type AuthServiceServer,
  type SignupResponse,
  type AuthTokens,
  type SignupRequest,
  Empty,
  LoginResponse,
  Disable2FARequest,
  Enable2FARequest,
  Enable2FAResponse,
  Verify2FARequest,
  Verify2FASetupRequest,
} from "@ecom/common";

import { status, type handleUnaryCall } from "@grpc/grpc-js";
import { AuthService } from "./auth.services";

export class AuthServiceController implements AuthServiceServer {
  [name: string]: any;

  signup: handleUnaryCall<SignupRequest, SignupResponse> = async (
    call,
    callback
  ) => {
    const data = validate<SignupRequest>(signupSchema, call.request);
    const user = await AuthService.SignUp(data);

    callback(null, {
      message: "User created successfully",
      email: user?.email!,
      userId: user?.id!,
    });
  };

  login: handleUnaryCall<LoginRequest, LoginResponse> = async (
    call,
    callback
  ) => {
    const data = validate<LoginRequest>(loginSchema, call.request);
    const ipAddress = call.metadata.get("ip")?.[0] || ("" as string);
    const userAgent = call.metadata.get("user-agent")?.[0] || ("" as string);

    const loginData = await AuthService.login(
      data,
      `${ipAddress}`,
      `${userAgent}`
    );

    callback(null, loginData);
  };

  logout: handleUnaryCall<any, Empty> = async (call, callback) => {
    callback(null, {});
  };

  refreshToken: handleUnaryCall<any, AuthTokens> = async (call, callback) => {
    callback(null, {
      refreshToken: "",
      sessionId: "",
      accessToken: "",
      accessTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  };
  changePassword: handleUnaryCall<ChangePasswordRequest, Empty> = async (
    call,
    callback
  ) => {
    callback(null, {});
  };
  forgotPassword: handleUnaryCall<ForgotPasswordRequest, Empty> = async (
    call,
    callback
  ) => {
    callback(null, {});
  };
  resetPassword: handleUnaryCall<ResetPasswordRequest, Empty> = async (
    call,
    callback
  ) => {
    callback(null, {});
  };
  getSession: handleUnaryCall<Empty, SessionInfo> = async (call, callback) => {
    callback(null, {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      issuedAt: new Date(Date.now()),
      sessionId: "",
      deviceInfo: "",

      ipAddress: "",
      userAgent: "",
      isMfaAuthenticated: false,
      metadata: {},
      permissions: [],
      user: {
        avatarUrl: "",
        createdAt: new Date(Date.now()),
        email: "",
        emailVerified: false,
        name: "",
        updatedAt: new Date(Date.now()),
        userId: "",
      },
    });
  };
  resendVerification: handleUnaryCall<ResendVerificationRequest, Empty> =
    async (call, callback) => {
      callback(null, {});
    };

  verifyAccount: handleUnaryCall<VerifyAccountRequest, Empty> = async (
    call,
    callback
  ) => {
    callback(null, {});
  };

  disable2Fa: handleUnaryCall<Disable2FARequest, Empty> = async (call, callback) => {
    callback(null, {});
  };

  enable2Fa: handleUnaryCall<Enable2FARequest, any> = async (call, callback) => {
    callback(null, {});
  };
  verify2Fa: handleUnaryCall<Verify2FARequest, any> = async (call, callback) => {
    callback(null, {});
  };
  verify2FaSetup: handleUnaryCall<Verify2FASetupRequest, Empty> = async (call, callback) => {
    callback(null, {});
  };

}
