import winston, { Logger } from "winston";

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp, service, stack }) => {
  return `${timestamp} [${level}] [${service}]: ${stack || message}`;
});

export const createLogger = (serviceName: string): Logger => {
  return winston.createLogger({
    level: process.env["LOG_LEVEL"] || "info",
    defaultMeta: { service: serviceName },
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      json()
    ),
    transports: [
      new winston.transports.Console({
        format:
          process.env["NODE_ENV"] === "production"
            ? combine(json())
            : combine(colorize(), devFormat),
      }),
    ],
  });
};

export const logger: Logger = createLogger("common");
