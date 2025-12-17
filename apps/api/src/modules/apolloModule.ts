import Elysia from "elysia";
import apollo from "@elysiajs/apollo";
import { customGraphqlError } from "@/utils/customGraphqlError";
import { userTypeDefs } from "./users/gql/typeDefs";
import { userResolvers } from "./users/gql/resolvers";

import { GlobalContext } from "@/utils/context";

export const apolloModules = new Elysia()
  .use(GlobalContext)
  .use([
    apollo({
      typeDefs: [userTypeDefs],
      resolvers: {
        Query: {
          ...userResolvers.Query,
        },
        Mutation: {
          ...userResolvers.Mutation,
        },
      },
      formatError(formattedError, error: any) {
        const customError = customGraphqlError(error);
        return {
          message: customError.message || formattedError.message,
          code: customError.code || formattedError.extensions?.["code"],
        };
      },

      context: async ({ request, ip }) => {
        const token = request.headers.get("Authorization");
        const origin = request.headers.get('origin')
        if(origin !== 'http://localhost:3000'){
          throw new Error('Unauthorized')
        }
        return {
          token,
          ip,
        };
      },
    }),
  ]);
