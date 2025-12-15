import { UserServiceClient } from "@ecom/common";
import * as grpc from "@grpc/grpc-js";
import { gatewayInterceptor } from "./gateway.interceptor";

const port = 50051;

export const userClient = new UserServiceClient(
  `localhost:${port}`,
  grpc.credentials.createInsecure(),
  {
    interceptors: [gatewayInterceptor],
  }
);
