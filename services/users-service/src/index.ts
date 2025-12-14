import { UserServiceService } from "@ecom/common";
import { Server, ServerCredentials } from "@grpc/grpc-js";

import { UsersService } from "./services/user.services";
import { config } from "./config/dotenv";

const server = new Server();

server.addService(UserServiceService, new UsersService());
server.bindAsync(
  `0.0.0.0:${config.PORT}`,
  ServerCredentials.createInsecure(),
  () => {
    console.log(`Server running at http://0.0.0.0:${config.PORT}`);
  }
);
