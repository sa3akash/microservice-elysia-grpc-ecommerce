import { db } from "@/config/db";
import { users, type TUser, type UserRole } from "@/utils/schema";
import { eq } from "drizzle-orm";

export abstract class UserRepository {

  // CREATE
  static async createUser(
    userData: Pick<TUser, "email" | "password" | 'name' | 'phone'>
  ) {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();

    return user;
  }

  // READ BY ID
  static async getUserById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  // READ BY EMAIL
  static async getUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  // UPDATE
  static async updateUser(
    id: string,
    updateData: Partial<TUser>
  ) {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  }

  // DELETE
  static async deleteUser(id: string) {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  }

  static async getUsers(limit: number, offset: number, role?: UserRole) {
    const getUsers = await db
      .select()
      .from(users)
      .where(role ? eq(users.role, role) : undefined)
      .limit(limit)
      .offset(offset);

    return getUsers;
  }
}
