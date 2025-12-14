import { UserServiceClient } from "@ecom/common";
import * as grpc from "@grpc/grpc-js";

const port = 50051;

export const client = new UserServiceClient(
  `localhost:${port}`,
  grpc.credentials.createInsecure()
);
