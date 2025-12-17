import { drizzle } from "drizzle-orm/node-postgres";

import { Pool } from "pg";
import * as schema from "../utils/schema";
import { config } from "./dotenv";

const pool = new Pool({
  connectionString: config.USER_DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export const closeDb = () => {
  pool.end();
};
