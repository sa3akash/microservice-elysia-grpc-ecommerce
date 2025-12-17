import { t } from "elysia";

export namespace AuthModel {
  export const signUpBody = t.Object({
    name: t.String({
        minLength: 3,
        maxLength: 100,
        error: "Name must be at least 3 characters long",
        examples: ["John Doe"],
    }),
    email: t.String({
      format: "email",
      error: "Invalid email",
      examples: ["test@example.com"],
    }),
    password: t.String({
        minLength: 8,
        maxLength: 100,
        error: "Password must be at least 8 characters long",
        examples: ["password126547"],
    }),
    phone: t.Optional(t.String({
        minLength: 11,
        maxLength: 11,
        error: "Phone number must be at least 11 characters long",
        examples: ["01712345678"],
    })),
  });

  export const signinBody = t.Object({
    identifier: t.String({
      format: "email",
      error: "Invalid email",
      examples: ["test@example.com"],
    }),
    password: t.String({
        minLength: 8,
        maxLength: 100,
        error: "Password must be at least 8 characters long",
        examples: ["password126547"],
    }),
  });


  export const signUpResponse = t.Object({
    message: t.String(),
    email: t.String(),
    userId: t.String(),
  });

  export const authTokens = t.Object({
    accessToken: t.String(),
    refreshToken: t.String(),
    accessTokenExpiresAt: t.Union([t.String(), t.Date()]),
    refreshTokenExpiresAt: t.Union([t.String(), t.Date()]),
    sessionId: t.String(),
  });

  export const user = t.Object({
    email: t.String(),
    name: t.String(),
    userId: t.String(),
    avatarUrl: t.String(),
    emailVerified: t.Boolean(),
    createdAt: t.Union([t.String(), t.Date()]),
    updatedAt: t.Union([t.String(), t.Date()]),
  });

  export const authSuccess = t.Object({
    tokens: t.Optional(authTokens),
    user: t.Optional(user),
  });

  export const twoFactorRequired = t.Object({
    message: t.String(),
    twoFactorSessionId: t.String(),
    type: t.Number(), // Enum
    deliveryMethod: t.Number(), // Enum
    maskedTarget: t.String(),
    expiresAt: t.Union([t.String(), t.Date()]),
    codeLength: t.Number(),
    canResend: t.Boolean(),
    resendAfter: t.Union([t.String(), t.Date()]),
  });

  export const loginResponse = t.Object({
    authSuccess: t.Optional(authSuccess),
    twoFactorRequired: t.Optional(twoFactorRequired),
  });

  export type SignUpBody = typeof signUpBody.static;
  export type TypeLoginResponse = typeof loginResponse.static;

}
