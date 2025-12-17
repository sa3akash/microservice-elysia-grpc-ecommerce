import { t } from "elysia";

export namespace UserModel {
  export const preferencesSchema = t.Object({
    language: t.Optional(t.String()),
    theme: t.Optional(t.String()),
  });

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
    phone: t.Optional(t.String()),
  });

  export const updateUserBody = t.Object({
    name: t.Optional(t.String()),
    email: t.Optional(
      t.String({
        format: "email",
        error: "Invalid email",
        examples: ["test@example.com"],
      })
    ),
    password: t.Optional(t.String()),
    phone: t.Optional(t.String()),
    avatar: t.Optional(t.String()),
    preferences: t.Optional(preferencesSchema),
  });

  export const deleteUserParams = t.Object({
    id: t.String(),
  });

  export const getUsersParams = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    role: t.Optional(t.String()),
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
    phone: t.Optional(t.String()),
    role: t.String(),
    avatar: t.Optional(t.String()),
    isVerified: t.Boolean(),
    isActive: t.Boolean(),
    preferences: t.Optional(preferencesSchema),
    createdAt: t.String(),
    updatedAt: t.String(),
  });

  export const UsersResponse = t.Object({
    users: t.Array(UserResponse),
    total: t.Number(),
  });

  export type SignInResponseType = typeof signInBody.static;
  export type SignUpRequestType = typeof signUpBody.static;
  export type updateUserResponseType = typeof updateUserBody.static;
  export type updateUserRequestType = typeof updateUserBody.static;
  export type deleteUserResponseType = typeof deleteUserParams.static;
  export type getUsersResponseType = typeof getUsersParams.static;
  export type getUserResponseType = typeof getUserParams.static;

  export type UserResponseType = typeof UserResponse.static;




}
