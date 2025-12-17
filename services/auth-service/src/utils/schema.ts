import { relations, sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* =========================
   AUTH (USERS)
========================= */
export const auth = pgTable(
  "auth",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 100 }).notNull(),

    // Argon2id / bcrypt hash
    password: text("password").notNull(),

    avatar: text("avatar"),
    coverImage: varchar("cover_image", { length: 255 }),
    // bio: text("bio"),

    // dateOfBirth: timestamp("date_of_birth"),
    // gender: varchar("gender", { length: 20 }),

    // timezone: varchar("timezone", { length: 50 }).default("UTC"),
    // language: varchar("language", { length: 10 }).default("en"),
    // currency: varchar("currency", { length: 10 }).default("USD"),

    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").default(false),

    phone: varchar("phone", { length: 20 }),
    phoneVerified: boolean("phone_verified").default(false),

    // 2FA
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    twoFactorSecret: varchar("two_factor_secret", { length: 255 }),

    // Account state
    isActive: boolean("is_active").default(true),
    isLocked: boolean("is_locked").default(false),
    lockReason: text("lock_reason"),
    lockUntil: timestamp("lock_until"),

    failedLoginAttempts: integer("failed_login_attempts").default(0),
    lastLogin: timestamp("last_login"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("auth_email_lower_unique").on(sql`LOWER(${table.email})`),
    index("auth_phone_idx").on(table.phone),
    index("auth_active_idx").on(table.isActive, table.isLocked),
  ]
);

/* =========================
   ROLES
========================= */
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").notNull().default([]), // string[]
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

/* =========================
   USER ↔ ROLE
========================= */
export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authId: uuid("auth_id")
      .notNull()
      .references(() => auth.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").defaultNow(),
    assignedBy: uuid("assigned_by").references(() => auth.id, {
      onDelete: "set null",
    }),
  },
  (table) => [uniqueIndex("user_role_unique").on(table.authId, table.roleId)]
);

/* =========================
   SESSIONS (HASHED TOKEN)
========================= */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authId: uuid("auth_id")
      .notNull()
      .references(() => auth.id, { onDelete: "cascade" }),

    // SHA-256 hash of session token
    sessionTokenHash: varchar("session_token_hash", { length: 64 })
      .notNull()
      .unique(),

    latitude: decimal("latitude", { precision: 9, scale: 6 }), // ±90.000000
    longitude: decimal("longitude", { precision: 9, scale: 6 }), // ±180.000000
    country: varchar("country", { length: 50 }),
    city: varchar("city", { length: 50 }),

    deviceInfo: jsonb("device_info"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),

    expiresAt: timestamp("expires_at").notNull(),
    isRevoked: boolean("is_revoked").default(false),
    revokedAt: timestamp("revoked_at"),

    createdAt: timestamp("created_at").defaultNow(),
    lastActivity: timestamp("last_activity").defaultNow(),
  },
  (table) => [
    index("sessions_user_active_idx").on(
      table.authId,
      table.isRevoked,
      table.expiresAt
    ),
  ]
);

/* =========================
   REFRESH TOKENS (ROTATION)
========================= */
export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authId: uuid("auth_id")
      .notNull()
      .references(() => auth.id, { onDelete: "cascade" }),

    // SHA-256 hash
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),

    parentTokenId: uuid("parent_token_id"),

    deviceId: varchar("device_id", { length: 255 }),

    expiresAt: timestamp("expires_at").notNull(),
    isRevoked: boolean("is_revoked").default(false),
    revokedAt: timestamp("revoked_at"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("refresh_token_active_idx").on(
      table.authId,
      table.isRevoked,
      table.expiresAt
    ),
  ]
);

/* =========================
   VERIFICATION TOKENS
========================= */
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authId: uuid("auth_id")
      .notNull()
      .references(() => auth.id, { onDelete: "cascade" }),

    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),

    type: varchar("type", { length: 50 }).notNull(),
    identifier: varchar("identifier", { length: 255 }),

    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("verification_token_lookup_idx").on(table.authId, table.type),
  ]
);

/* =========================
   LOGIN HISTORY (AUDIT)
========================= */
export const loginHistory = pgTable(
  "login_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authId: uuid("auth_id")
      .notNull()
      .references(() => auth.id, { onDelete: "cascade" }),

    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    deviceType: varchar("device_type", { length: 50 }),
    browser: varchar("browser", { length: 100 }),
    platform: varchar("platform", { length: 100 }),

    success: boolean("success").notNull(),
    failureReason: text("failure_reason"),

    attemptAt: timestamp("attempt_at").defaultNow(),
  },
  (table) => [
    index("login_history_user_time_idx").on(table.authId, table.attemptAt),
  ]
);

/* =========================
   RELATIONS
========================= */
export const authRelations = relations(auth, ({ many }) => ({
  sessions: many(sessions),
  refreshTokens: many(refreshTokens),
  verificationTokens: many(verificationTokens),
  loginHistory: many(loginHistory),
  userRoles: many(userRoles),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  auth: one(auth, { fields: [sessions.authId], references: [auth.id] }),
}));

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  auth: one(auth, {
    fields: [refreshTokens.authId],
    references: [auth.id],
  }),
}));

export const userRoleRelations = relations(userRoles, ({ one }) => ({
  auth: one(auth, { fields: [userRoles.authId], references: [auth.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));


export type Auth = typeof auth.$inferSelect;
export type Session = typeof sessions.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type LoginHistory = typeof loginHistory.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type Role = typeof roles.$inferSelect;