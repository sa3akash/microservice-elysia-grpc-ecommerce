import {
  authInterceptor,
  AuthServiceService,
  globalErrorInterceptor,
  loggingInterceptor,
  wrapGrpcService,
} from "@ecom/common";

import { Server, ServerCredentials } from "@grpc/grpc-js";
import { config } from "@/config/dotenv";
import { logger } from "@/utils/logger";
import { closeDb, connectDb } from "@/config/db";
import { AuthServiceController } from "@/services/auth.controller";

const server = new Server({
  interceptors: [globalErrorInterceptor, authInterceptor, loggingInterceptor],
});

server.addService(
  AuthServiceService,
  wrapGrpcService(new AuthServiceController())
);

server.bindAsync(
  `0.0.0.0:${config.PORT}`,
  ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      logger.error("Failed to bind server", { error: err });
      process.exit(1);
    }
    logger.info(`Users Service running on port ${port}`);
    connectDb()
  }
);

// =========== Process Events ===========

const closeServr = () => {
  logger.info("Users Service shutting down");
  server.tryShutdown(() => {
    logger.info("Users Service shutdown");
    closeDb();
    process.exit(0);
  });
};

process.on("SIGINT", closeServr);

process.on("SIGTERM", closeServr);

process.on("exit", () => {
  logger.info("Users Service exiting");
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { error: err });
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason });
});

process.on("uncaughtExceptionMonitor", (err) => {
  logger.error("Uncaught Exception Monitor", { error: err });
});

process.on("warning", (warning) => {
  logger.warn("Warning", { warning });
});

process.on("beforeExit", (code) => {
  logger.info("Before Exit", { code });
});

process.on("multipleResolves", (type, promise, reason) => {
  logger.error("Multiple Resolves", { type, promise, reason });
});

process.on("rejectionHandled", (promise) => {
  logger.info("Rejection Handled", { promise });
});
