import { AuthRepository } from "@/repository/auth.repository";
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
  VerificationType,
} from "@ecom/common";
import bcrypt from "bcryptjs";

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
      createdAt: user?.createdAt,
      email: user?.email!,
      userId: user?.id!,
      verificationRequired: user?.emailVerified ?? false,
      verificationType: VerificationType.VERIFICATION_TYPE_EMAIL,
    });
  };

  login: handleUnaryCall<LoginRequest, AuthTokens> = async (call, callback) => {
    const data = validate<LoginRequest>(loginSchema, call.request);

    const user = await AuthRepository.getUserByIdenfire(data.identifier);

    if (!user || !bcrypt.compareSync(data.password, user.password)) {
      throw new AppError(status.NOT_FOUND, "Invalid credentials.");
    }

    if (!user.isActive) {
      // todo: send email for send resone to inactivate account
      throw new AppError(status.UNAUTHENTICATED, "User is not active");
    }

    if (!user.emailVerified) {
      // todo: send verification email
      throw new AppError(
        status.UNAUTHENTICATED,
        "User not verified. Check your email for verification link"
      );
    }

    const authTokens: AuthTokens = {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      refreshToken: "",
      sessionId: "",
    };

    // const tokens = await generateTokens(user.id);

    callback(null, authTokens);
  };

  logout: handleUnaryCall<any, Empty> = async (call, callback) => {
    callback(null, {});
  };

  refreshToken: handleUnaryCall<any, AuthTokens> = async (call, callback) => {
    callback(null, {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      refreshToken: "",
      sessionId: "",
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
      email: "email",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      emailVerified: true,
      issuedAt: new Date(Date.now()),
      phone: "",
      phoneVerified: true,
      userId: "12364",
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
}
