import Elysia from "elysia";
import apollo from "@elysiajs/apollo";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { customGraphqlError } from "@/utils/customGraphqlError";

export const apolloModules = new Elysia().use([
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
]);
