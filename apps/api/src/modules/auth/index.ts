import Elysia from "elysia";
import { verificationTypeToJSON } from "@ecom/common";
import { AuthModel } from "./auth.model";
import { AuthService } from "./auth.service";
import { CustomError } from "@/config/CommonError";

export const auth = new Elysia({ prefix: "/auth" }).post(
  "/signup",
  async ({ body }) => {
    const response = await AuthService.signUp(body);
    return {
      ...response,
      createdAt: response.createdAt?.toISOString() ?? "",
      verificationType: verificationTypeToJSON(response.verificationType),
    };
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
);
