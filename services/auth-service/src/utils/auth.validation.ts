import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1,{ error: "Name must be at least 1 character long"}),
  email: z.email({ error: "Invalid email address."}),
  password: z.string().min(8,{ error: "Password must be at least 8 characters long"}),
  phone: z.optional(z.string().min(11,{ error: "Invalid phone number."})),
});

const emailSchema = z.email({error: "Invalid email address."});

const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number");

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .refine(
      (val) =>
        emailSchema.safeParse(val).success ||
        phoneSchema.safeParse(val).success,
      {
        message: "Identifier must be a valid email or phone number",
      }
    ),
  password: z.string().min(8,{ error: "Password must be at least 8 characters long"}),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8,{ error: "Password must be at least 8 characters long"}),
  confirmPassword: z.string().min(8,{ error: "Password must be at least 8 characters long"}),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8,{ error: "Password must be at least 8 characters long"}),
  newPassword: z.string().min(8,{ error: "Password must be at least 8 characters long"}),
  confirmPassword: z.string().min(8,{ error: "Password must be at least 8 characters long"}),
});

export const changeEmailSchema = z.object({
  email: z.email({ error: "Invalid email address."}),
});

export const changePhoneSchema = z.object({
  phone: z.string().min(11,{ error: "Invalid phone number."}),
});

export const verifyEmailSchema = z.object({
  email: z.email({ error: "Invalid email address."}),
});

export const verifyPhoneSchema = z.object({
  phone: z
  .string()
  .regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number")
});

export type SignupSchema = z.infer<typeof signupSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type ChangeEmailSchema = z.infer<typeof changeEmailSchema>;
export type ChangePhoneSchema = z.infer<typeof changePhoneSchema>;
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
export type VerifyPhoneSchema = z.infer<typeof verifyPhoneSchema>;
