import Elysia from "elysia";
import { users } from "./users";
import { openapiMiddleware } from "@/utils/openapi.config";
import apollo from "@elysiajs/apollo";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

export const modules = new Elysia()
  .use([
    openapiMiddleware,
    apollo({
      typeDefs,
      resolvers,
    }),
  ])
  .use(users);
