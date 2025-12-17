import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/utils/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env["USER_DATABASE_URL"]!,
  },
});
