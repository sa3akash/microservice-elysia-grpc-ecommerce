// import * as grpc from '@grpc/grpc-js';
// import * as protoLoader from '@grpc/proto-loader';
import { UserServiceService } from "@ecom/common";
import { Server, ServerCredentials } from "@grpc/grpc-js";

// const PROTO_PATH = import.meta.resolve('../../../protos/user.proto');

import { UsersService } from "./services/user.services";

const server = new Server();

const PORT = "50051";

server.addService(UserServiceService, new UsersService());
server.bindAsync(`0.0.0.0:${PORT}`, ServerCredentials.createInsecure(), () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
