import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { modules } from "./modules/module";
import { config } from "./config/dotenv";
import { errorHandler, MyError } from "./utils/customError";
import { logger } from "./utils/logger";

const app = new Elysia()
  .error({ MyError })
  .onError(errorHandler)
  .use([cors(), modules])

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
  .listen(config.PORT);

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

process.on("SIGINT", () => {
  logger.warn("\nShutting down gracefully...");
  process.exit(0);
});
