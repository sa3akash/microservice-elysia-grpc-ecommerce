import { db } from "@/config/db";
import { auth } from "@/utils/schema";
import type { SignupRequest } from "@ecom/common";
import { eq, or } from "drizzle-orm";

export abstract class AuthRepository {

  // CREATE
  static async createUser(
    signInData: SignupRequest
  ) {
    const [authData] = await db
      .insert(auth)
      .values(signInData)
      .returning();

    return authData;
  }

  static async getUserByEmail(
    email: string
  ) {
    const [authData] = await db
      .select()
      .from(auth)
      .where(eq(auth.email, email))
      .limit(1);

    return authData;
  }

  static async getUserByIdenfire(identifier:string){
    const [authData] = await db
      .select()
      .from(auth)
      .where(or(eq(auth.email, identifier), eq(auth.phone, identifier)))
      .limit(1);

    return authData;
  }

  static async getUserById(
    id: string
  ) {
    const [authData] = await db
      .select()
      .from(auth)
      .where(eq(auth.id, id))
      .limit(1);

    return authData;
  }

  static async getUserByPhone(
    phone: string
  ) {
    const [authData] = await db
      .select()
      .from(auth)
      .where(eq(auth.phone, phone))
      .limit(1);

    return authData;
  }

  static async emailVarified(
    email: string
  ) {
    const [authData] = await db
      .update(auth)
      .set({ emailVerified: true })
      .where(eq(auth.email, email))
      .returning();

    return authData;
  }

  static async phoneVarified(
    phone: string
  ) {
    const [authData] = await db
      .update(auth)
      .set({ phoneVerified: true })
      .where(eq(auth.phone, phone))
      .returning();

    return authData;
  }

  static async changePassword(
    email: string,
    password: string
  ) {
    const [authData] = await db
      .update(auth)
      .set({ password })
      .where(eq(auth.email, email))
      .returning();

    return authData;
  }
 
}
