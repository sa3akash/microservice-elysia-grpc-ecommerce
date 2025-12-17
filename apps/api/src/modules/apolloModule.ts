import Elysia from "elysia";
import apollo from "@elysiajs/apollo";
import { customGraphqlError } from "@/utils/customGraphqlError";

import { GlobalContext } from "@/utils/context";
import { authResolvers } from "@/modules/auth/gql/resolvers";
import { authTypeDefs } from "@/modules/auth/gql/typeDefs";

export const apolloModules = new Elysia()
  .use(GlobalContext)
  .use([
    apollo({
      typeDefs: [authTypeDefs],
      resolvers: {
        // ...authResolvers,
        Query: {
          // ...userResolvers.Query,
          ...authResolvers.Query,
        },
        Mutation: {
          // ...userResolvers.Mutation,
          ...authResolvers.Mutation,
        },
      },
      formatError(formattedError, error: any) {
        const customError = customGraphqlError(error);
        return {
          message: customError.message || formattedError.message,
          code: customError.code || formattedError.extensions?.["code"],
        };
      },

      context: async ({ request, ip, cookie }) => {
        const userAgent = request.headers.get("user-agent");
        // const origin = request.headers.get('origin')
        //  if(origin !== 'http://localhost:3000'){
        //   throw new Error('Unauthorized')
        //  }
        return {
          userAgent,
          ip,
          cookie,
        };
      },
    }),
  ]);
