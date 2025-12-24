import { validate } from "@/utils/validation";
import { t } from "elysia";
import { AuthModel } from "../auth.model";
import { AuthService } from "../auth.service";


export const authResolvers = {
  Query: {
    user: async (_: any, { id: _id }: { id: string }) => {
      // return await UserService.getUserById(id);
    },
  },
  Mutation: {
    createUser: validate(
      t.Object({ input: AuthModel.signUpBody }),
      async (_: any, { input }: { input: AuthModel.SignUpBody }) => {
        return await AuthService.signUp(input);
      }
    ),
    login: validate(
      t.Object({ input: AuthModel.signinBody }),
      async (
        _: any,
        { input }: { input: AuthModel.SignInBody },
        { ip, userAgent, cookie }: any
      ) => {
        const response = await AuthService.login(input, ip || "", userAgent || "");

        if (response.authSuccess?.tokens?.accessToken) {
          cookie.accessToken.set({
            value: response.authSuccess.tokens.accessToken,
            httpOnly: true,
            path: "/",
            expires: response.authSuccess.tokens.accessTokenExpiresAt
              ? new Date(response.authSuccess.tokens.accessTokenExpiresAt)
              : undefined,
          });
        }

        if (response.authSuccess?.tokens?.refreshToken) {
          cookie.refreshToken.set({
            value: response.authSuccess.tokens.refreshToken,
            httpOnly: true,
            path: "/",
            expires: response.authSuccess.tokens.refreshTokenExpiresAt
              ? new Date(response.authSuccess.tokens.refreshTokenExpiresAt)
              : undefined,
          });
        }

        const user = response.authSuccess?.user;

        return {
          result: user
            ? {
                ...user,
                id: user.userId,
                isVerified: user.emailVerified,
                isActive: true, // Assuming active if logged in, or check user property
                role: "USER", // Default or fetch from user if available
                preferences: {},
                __typename: "User",
              }
            : response.twoFactorRequired
            ? { ...response.twoFactorRequired, __typename: "TwoFactorRequired" }
            : null,
        };
      }
    ),
  },
  LoginResult: {
    __resolveType(obj: any, _context: any, _info: any) {
      if (obj.twoFactorSessionId) {
        return "TwoFactorRequired";
      }
      if (obj.id || obj.userId) {
        return "User";
      }
      return null;
    },
  },
};
