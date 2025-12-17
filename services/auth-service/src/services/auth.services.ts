import { AuthRepository } from "@/repository/auth.repository";
import bcrypt from "bcryptjs";

import {
  AppError,
  type LoginRequest,
  type SignupRequest,
  type AuthTokens,
  type LoginResponse,
  TwoFactorType,
  TwoFactorDeliveryMethod,
} from "@ecom/common";
import { status } from "@grpc/grpc-js";
import { generateAccessToken, generateRefreshToken } from "@/utils/tokens";
import { SessionRepository } from "@/repository/sesstion.repository";

export abstract class AuthService {
  static async SignUp(data: SignupRequest) {
    const userExist = await AuthRepository.getUserByEmail(data.email);
    if (userExist) {
      throw new AppError(status.ALREADY_EXISTS, "User already exists");
    }
    const user = await AuthRepository.createUser({
      ...data,
      password: bcrypt.hashSync(data.password, 10),
    });

    //todo: send verification email

    //todo: rabbitmq send user created event
    return user;
  }

  static async login(
    data: LoginRequest,
    ipAddress: string,
    userAgent: string
  ): Promise<LoginResponse> {
    const user = await AuthRepository.getUserByIdenfire(data.identifier);
    if (!user || !bcrypt.compareSync(data.password, user.password)) {
      throw new AppError(status.INVALID_ARGUMENT, "Invalid credentials.");
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

    if (user.twoFactorEnabled) {
      return {
        twoFactorRequired: {
          twoFactorSessionId: "",
          type: TwoFactorType.TWO_FACTOR_TYPE_EMAIL_OTP,
          canResend: true,
          codeLength: 6,
          deliveryMethod: TwoFactorDeliveryMethod.TWO_FACTOR_DELIVERY_EMAIL,
          maskedTarget: user.email,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          resendAfter: new Date(Date.now() + 60 * 60 * 1000),
          message: "Check your email for 2FA code",
        },
      };
    }

    const session = await SessionRepository.createSession(
      user.id,
      ipAddress,
      userAgent
    );

    // todo: send login email to user

    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken({
        authId: user.id,
        sessionId: session?.id!,
        sessionTokenHash: session?.sessionTokenHash!,
      }),
      generateRefreshToken({
        authId: user.id,
        ipAddress: ipAddress,
        userAgent: userAgent,
      }),
    ]);

    const authTokens: AuthTokens = {
      accessToken: accessToken,
      accessTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      refreshToken: refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sessionId: session?.id!,
    };

    return {
      authSuccess: {
        tokens: authTokens,
        user: {
          email: user.email,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          avatarUrl: user.avatar ?? "",
          name: user.name,
          userId: user.id,
        },
      },
    };
  }
}
