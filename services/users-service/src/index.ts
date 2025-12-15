import {
  UserServiceService,
  applyInterceptors,
  AuthInterceptor,
  ErrorInterceptor,
} from "@ecom/common";

import { Server, ServerCredentials } from "@grpc/grpc-js";
import { config } from "./config/dotenv";
import { UsersService } from "./services/user.services";
import { logger } from "./utils/logger";
import { closeDb } from "./config/db";

const server = new Server();

const interceptors = [
  new ErrorInterceptor(),
  new AuthInterceptor(["createUser", "getUser"]),
];

server.addService(
  UserServiceService,
  applyInterceptors(new UsersService(), interceptors)
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
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason });
  process.exit(1);
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
