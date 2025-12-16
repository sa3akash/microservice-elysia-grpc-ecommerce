import Elysia from "elysia";
import apollo from "@elysiajs/apollo";
import { customGraphqlError } from "@/utils/customGraphqlError";
import { userTypeDefs } from "./users/gql/typeDefs";
import { userResolvers } from "./users/gql/resolvers";

export const apolloModules = new Elysia().use([
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
    
    context: async ({ request }) => {
      const token = request.headers.get("Authorization");
      console.log({token},request)
      return {
        token: "hello",
      };
    },

  }),
]);
