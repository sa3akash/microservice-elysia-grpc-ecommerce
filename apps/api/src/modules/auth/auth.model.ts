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
  

  export const signUpResponse = t.Object({
    message: t.String(),
    createdAt: t.String(),
    email: t.String(),
    userId: t.String(),
    verificationRequired: t.Boolean(),
    verificationType: t.String(),
  });

  export type SignUpBody = typeof signUpBody.static;

}
