CREATE TABLE "auth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"password" text NOT NULL,
	"avatar" text,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"phone" varchar(20),
	"phone_verified" boolean DEFAULT false,
	"two_factor_enabled" boolean DEFAULT false,
	"two_factor_secret" varchar(255),
	"is_active" boolean DEFAULT true,
	"is_locked" boolean DEFAULT false,
	"lock_reason" text,
	"lock_until" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"last_login" timestamp,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"device_type" varchar(50),
	"browser" varchar(100),
	"platform" varchar(100),
	"success" boolean NOT NULL,
	"failure_reason" text,
	"attempt_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"parent_token_id" uuid,
	"device_id" varchar(255),
	"expires_at" timestamp NOT NULL,
	"is_revoked" boolean DEFAULT false,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid NOT NULL,
	"session_token_hash" varchar(64) NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"country" varchar(50),
	"city" varchar(50),
	"device_info" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"is_revoked" boolean DEFAULT false,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"last_activity" timestamp DEFAULT now(),
	CONSTRAINT "sessions_session_token_hash_unique" UNIQUE("session_token_hash")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" uuid
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"type" varchar(50) NOT NULL,
	"identifier" varchar(255),
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "verification_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_auth_id_auth_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_auth_id_auth_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_auth_id_auth_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_auth_id_auth_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_auth_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."auth"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_auth_id_auth_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_email_lower_unique" ON "auth" USING btree (LOWER("email"));--> statement-breakpoint
CREATE INDEX "auth_phone_idx" ON "auth" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "auth_active_idx" ON "auth" USING btree ("is_active","is_locked");--> statement-breakpoint
CREATE INDEX "login_history_user_time_idx" ON "login_history" USING btree ("auth_id","attempt_at");--> statement-breakpoint
CREATE INDEX "refresh_token_active_idx" ON "refresh_tokens" USING btree ("auth_id","is_revoked","expires_at");--> statement-breakpoint
CREATE INDEX "sessions_user_active_idx" ON "sessions" USING btree ("auth_id","is_revoked","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_unique" ON "user_roles" USING btree ("auth_id","role_id");--> statement-breakpoint
CREATE INDEX "verification_token_lookup_idx" ON "verification_tokens" USING btree ("auth_id","type");