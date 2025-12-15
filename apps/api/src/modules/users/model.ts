import { t } from "elysia";

export namespace UserModel {
  export const signInBody = t.Object({
    email: t.String({
      format: "email",
      required: true,
      error: "Invalid email",
      examples: ["test@example.com"],
    }),
    password: t.String(),
  });

  export const signUpBody = t.Object({
    name: t.String(),
    email: t.String({
      format: "email",
      required: true,
      error: "Invalid email",
      examples: ["test@example.com"],
    }),
    password: t.String(),
    phone: t.String(),
  });

  export const updateUserBody = t.Object({
    name: t.String(),
    email: t.String({
      format: "email",
      required: true,
      error: "Invalid email",
      examples: ["test@example.com"],
    }),
    password: t.String(),
    phone: t.String(),
    avatar: t.String(),
    preferences: t.Object({}),
  });

  export const deleteUserParams = t.Object({
    id: t.String(),
  });

  export const getUsersParams = t.Object({
    limit: t.String(),
    offset: t.String(),
    role: t.String(),
  });

  export const getUserParams = t.Object({
    id: t.String(),
  });

  export const getUserQuery = t.Object({
    id: t.String(),
  });

  export const UserResponse = t.Object({
    id: t.String(),
    email: t.String(),
    name: t.String(),
    phone: t.String(),
    role: t.String(),
    avatar: t.String(),
    isVerified: t.Boolean(),
    isActive: t.Boolean(),
    preferences: t.Object({}),
    createdAt: t.String(),
    updatedAt: t.String(),
  });

  export const UsersResponse = t.Object({
    users: t.Array(UserModel.UserResponse),
    total: t.Number(),
  });

  export type SignInResponseType = typeof signInBody.static;
  export type SignUpRequestType = typeof signUpBody.static;
  export type updateUserResponseType = typeof updateUserBody.static;
  export type updateUserRequestType = typeof updateUserBody.static;
  export type deleteUserResponseType = typeof deleteUserParams.static;
  export type getUsersResponseType = typeof getUsersParams.static;
  export type getUserResponseType = typeof getUserParams.static;
  export type signInInvalidType = typeof signInInvalid.static;
  export type signUpInvalidType = typeof signUpInvalid.static;

  export type UserResponseType = typeof UserResponse.static;

  export const signInInvalid = t.Literal("Invalid username or password");
  export type signInInvalid = typeof signInInvalid.static;

  export const signUpInvalid = t.Literal("Invalid username or password");
  export type signUpInvalid = typeof signInInvalid.static;
}
