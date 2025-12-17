import { AuthServiceClient } from "@ecom/common";
import * as grpc from "@grpc/grpc-js";
import { gatewayInterceptor } from "./interceptors/gateway.interceptor";
import { config } from "@/config/dotenv";

export const authClient = new AuthServiceClient(
  `localhost:${config.AUTH_SERVICE_PORT}`,
  grpc.credentials.createInsecure(),
  {
    interceptors: [gatewayInterceptor],
  }
);
