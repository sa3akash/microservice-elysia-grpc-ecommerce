import { config } from "@/config/dotenv";
import { AppError } from "@ecom/common";
import { status } from "@grpc/grpc-js";
import jwt from "jsonwebtoken";

export type RefreshTokenData = {
  authId: string;
  ipAddress: string;
  userAgent: string;
};

export type AccessTokenData = {
  authId: string;
  sessionId: string;
  sessionTokenHash: string;
};

export const generateAccessToken = (user: AccessTokenData) => {
  return jwt.sign(user, config.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const generateRefreshToken = (user: RefreshTokenData) => {
  return jwt.sign(user, config.JWT_SECRET_REFRESH, {
    expiresIn: "30d",
  });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as AccessTokenData;
  } catch {
    throw new AppError(status.UNAUTHENTICATED, "Invalid access token");
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, config.JWT_SECRET_REFRESH) as RefreshTokenData;
  } catch {
    throw new AppError(status.UNAUTHENTICATED, "Invalid refresh token");
  }
};
