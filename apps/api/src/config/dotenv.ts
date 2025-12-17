import { logger } from "@/utils/logger";

class Dotenv {
  public GATEWAY_PORT: string = process.env["GATEWAY_PORT"] || "3000";
  public AUTH_SERVICE_PORT: string = process.env["AUTH_SERVICE_PORT"] || "50050";
  public USERS_SERVICE_PORT: string = process.env["USERS_SERVICE_PORT"] || "50051";
  public INTERNAL_GATEWAY_VALUE: string = process.env["INTERNAL_GATEWAY_VALUE"] || "gateway";

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