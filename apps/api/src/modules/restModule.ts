import Elysia from "elysia";
import { users } from "./users";
import { openapiMiddleware } from "@/utils/openapi.config";
import apollo from "@elysiajs/apollo";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { customGraphqlError } from "@/utils/customGraphqlError";

export const restModules = new Elysia()
  .use([
    openapiMiddleware,
    apollo({
      typeDefs,
      resolvers,
      formatError(formattedError, error: any) {
        const customError = customGraphqlError(error);
        return {
          message: customError.message || formattedError.message,
          code: customError.code || formattedError.extensions?.["code"],
        };
      },
    }),
  ])
  .use(users);
