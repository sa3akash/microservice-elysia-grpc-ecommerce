import Elysia, { t } from "elysia";
import { AuthModel } from "./auth.model";
import { AuthService } from "./auth.service";
import { CustomError } from "@/config/CommonError";
import { GlobalContext } from "@/utils/context";

export const auth = new Elysia({ prefix: "/auth" })
  .use(GlobalContext)
  .post(
    "/signup",
    async ({ body }) => {
      const response = await AuthService.signUp(body);
      return response;
    },
    {
      body: AuthModel.signUpBody,
      tags: ["Auth"],
      detail: {
        description: "Create a new user",
        summary: "Create a new user",
      },
      response: {
        200: AuthModel.signUpResponse,
        400: CustomError.errorResponse,
        409: CustomError.errorResponse,
        500: CustomError.errorResponse,
      },
    }
  )
  .post(
    "/login",
    async ({ body, headers, ip, cookie }) => {
      const userAgent = headers["user-agent"] as string;
      const response = await AuthService.login(body, ip || "", userAgent);

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

      return {
        twoFactorRequired: response.twoFactorRequired,
        user: response.authSuccess?.user,
      } as AuthModel.TypeLoginResponse;
    },
    {
      body: AuthModel.signinBody,
      cookie: t.Object({
        accessToken: t.Optional(t.String()),
        refreshToken: t.Optional(t.String()),
      }),
      tags: ["Auth"],
      detail: {
        description: "Login user",
        summary: "Login user",
      },
      response: {
        200: AuthModel.loginResponse,
        400: CustomError.errorResponse,
        500: CustomError.errorResponse,
      },
    }
  );
