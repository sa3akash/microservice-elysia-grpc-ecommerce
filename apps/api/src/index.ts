import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { restModules } from "./modules/restModule";
import { config } from "./config/dotenv";
import { errorHandler, GatewayError } from "./utils/customError";
import { logger } from "./utils/logger";
import { apolloModules } from "./modules/apolloModule";
import { openapiMiddleware } from "./utils/openapi.config";

import { GlobalContext } from "./utils/context";

const app = new Elysia()
  .error({ GatewayError })
  .onError(errorHandler)
  .use(GlobalContext)
  .use([cors(), openapiMiddleware, restModules, apolloModules])
  .get("/", ({ redirect }) => {
    return redirect("/openapi");
  })
  .get("/health", () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      pid: process.pid,
    };
  })
  .listen(config.GATEWAY_PORT);

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

process.on("SIGINT", () => {
  logger.warn("\nShutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.warn("\nShutting down gracefully...");
  process.exit(0);
});
