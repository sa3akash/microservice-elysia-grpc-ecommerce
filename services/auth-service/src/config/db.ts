import { drizzle } from "drizzle-orm/node-postgres";

import { Pool } from "pg";
import * as schema from "../utils/schema";
import { config } from "./dotenv";
import { logger } from "@/utils/logger";

const pool = new Pool({
  connectionString: config.AUTH_DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export const connectDb = () => {
  pool
    .connect()
    .then(() => {
      logger.info("PostgreSQL connection pool connected");
    })
    .catch((err) => {
      logger.error("PostgreSQL connection pool error fix connection url", err);
      process.exit(1);
    });
};

export const closeDb = () => {
  pool
    .end()
    .then(() => {
      logger.info("PostgreSQL connection pool closed");
    })
    .catch((err) => {
      logger.error("PostgreSQL connection pool error fix connection url", err);
      process.exit(1);
    });
};
