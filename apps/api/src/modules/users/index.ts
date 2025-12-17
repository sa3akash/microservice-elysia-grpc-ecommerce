import Elysia from "elysia";
import { UserService } from "./users.service";
import { GatewayError } from "@/utils/customError";
import { UserModel } from "./users.model";
import { errorResponse } from "@/interfaces/errorResponse";
import { CustomError } from "@/config/CommonError";

export const users = new Elysia({ prefix: "/users" })
  .get(
    "/:id",
    async ({ params }) => {
      const response = await UserService.getUserById(params.id);

      if (!response) {
        throw new GatewayError("User not found", 404);
      }
      return response as any;
    },
    {
      params: UserModel.getUserParams,
      tags: ["User"],
      detail: {
        description: "Get a user by ID",
        summary: "Get a user by ID",
      },
      response: {
        200: UserModel.UserResponse,
        404: CustomError.errorResponse,
        500: CustomError.errorResponse,
      },
    }
  )
  .post(
    "/create",
    async ({ body }) => {
      const response = await UserService.createUser(body);
      return response as any;
    },
    {
      body: UserModel.signUpBody,
      tags: ["User"],
      detail: {
        description: "Create a new user",
        summary: "Create a new user",
      },
      response: {
        200: UserModel.UserResponse,
        400: CustomError.errorResponse,
        500: CustomError.errorResponse,
      },
    }
  )
  .put(
    "/update/:id",
    async ({ params, body }) => {
      const response = await UserService.updateUser(params.id, body);
      return response as any;
    },
    {
      params: UserModel.getUserParams,
      body: UserModel.updateUserBody,
      tags: ["User"],
      detail: {
        description: "Update a user",
        summary: "Update a user",
      },
      response: {
        200: UserModel.UserResponse,
        400: CustomError.errorResponse,
        404: CustomError.errorResponse,
        500: CustomError.errorResponse,
      },
    }
  )
  .delete(
    "/delete/:id",
    async ({ params }) => {
      const response = await UserService.deleteUser(params.id);
      return response as any;
    },
    {
      params: UserModel.deleteUserParams,
      tags: ["User"],
      detail: {
        description: "Delete a user",
        summary: "Delete a user",
      },
      response: {
        200: UserModel.UserResponse,
        400: CustomError.errorResponse,
        404: CustomError.errorResponse,
        500: CustomError.errorResponse,
      },
    }
  );
