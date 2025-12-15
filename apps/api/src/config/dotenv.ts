import { logger } from "@/utils/logger";

class Dotenv {
  public PORT: string = process.env["PORT"] || "3000";

  public static load() {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined || value === null) {
        logger.error(`${key} env is not defined.`);
        process.exit(1);
      }
    }
  }
}

export const config: Dotenv = new Dotenv();