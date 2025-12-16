import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const Roles = pgEnum("roles", [
  "customer",
  "vendor",
  "admin",
  "super_admin",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    phone: text("phone").notNull(),

    avatar: text("avatar"),

    isVerified: boolean("is_verified").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),

    role: Roles("role").notNull().default("customer"),

    preferences: jsonb("preferences")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("email_idx").on(table.email),
    index("role_idx").on(table.role),
  ])


export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
  type: text("type").notNull(), // home, work, other
  street: text("street").notNull(),
  zipCode: text("zip_code").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
},(table)=>[
  index("user_id_idx").on(table.userId),
]);

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses)
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));


export type TUser = typeof users.$inferInsert;
export type TAddresses = typeof addresses.$inferSelect;
export type UserRole = typeof Roles.enumValues[number];
