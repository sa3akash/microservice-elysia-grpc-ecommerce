import {
  Metadata,
  type ServerUnaryCall,
  status,
  type sendUnaryData,
} from "@grpc/grpc-js";
import { AppError } from "./errors";
import { logger } from "../utils";

/**
 * Standardizes error handling for gRPC calls.
 * Maps AppError and unknown errors to gRPC Status Objects.
 */
const handleGrpcError = (error: any, callback: sendUnaryData<any>) => {
  
  if (error instanceof AppError) {
    return callback(error.toServiceError(), null);
  }
  
  logger.error("error",error);

  const message = "Internal Server Error";
  const metadata = new Metadata();
  metadata.set("message", message);

  return callback(
    {
      code: status.INTERNAL,
      message,
      metadata,
    },
    null
  );
};

/**
 * Wraps a gRPC service implementation object.
 * Automatically wraps every method in a try/catch block to handle async errors.
 * Mutates the service object in place to preserve prototype chain.
 */
export const wrapGrpcService = <T extends object>(service: T): T => {
  const prototype = Object.getPrototypeOf(service);

  // Get all properties from both the instance and the prototype
  const propertyNames = new Set([
    ...Object.getOwnPropertyNames(service),
    ...Object.getOwnPropertyNames(prototype),
  ]);

  propertyNames.forEach((key) => {
    if (key === "constructor") return;

    // @ts-ignore
    const method = service[key];

    if (typeof method === "function") {
      // @ts-ignore
      service[key] = async (
        call: ServerUnaryCall<any, any>,
        callback: sendUnaryData<any>
      ) => {
        try {
          await method.call(service, call, callback);
        } catch (error) {
          handleGrpcError(error, callback);
        }
      };
    }
  });

  return service;
};
