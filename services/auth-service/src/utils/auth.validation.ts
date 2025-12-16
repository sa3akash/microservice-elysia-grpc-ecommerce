import { z } from "zod";

export const getUserSchema = z.object({
  id: z.uuid("Invalid user id"),
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  phone: z.string().min(8),
});

export const updateUserSchema = z.object({
  id: z.uuid(),
  name: z.string().optional(),
  email: z.email().optional(),
  password: z.string().min(8).optional(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  preferences: z.record(z.any(),z.any()).optional(),
});

export const deleteUserSchema = z.object({
  id: z.uuid(),
});

export const getUsersSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  role: z.enum(["customer", "vendor", "admin", "super_admin"]).optional(),
});
