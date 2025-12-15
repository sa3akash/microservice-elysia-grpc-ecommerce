import { UserServiceClient } from "@ecom/common";
import * as grpc from "@grpc/grpc-js";
import { gatewayInterceptor } from "./gateway.interceptor";
import { config } from "@/config/dotenv";

export const userClient = new UserServiceClient(
  `localhost:${config.USERS_SERVICE_PORT}`,
  grpc.credentials.createInsecure(),
  {
    interceptors: [gatewayInterceptor],
  }
);
