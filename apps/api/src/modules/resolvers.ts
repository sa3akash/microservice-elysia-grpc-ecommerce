import { resolvers as userResolvers } from "./users/gql/resolvers";

export const resolvers = {
  Query: {
    books: () => {
      return [
        {
          title: "Elysia",
          author: "saltyAom",
        },
      ];
    },
    ...userResolvers.Query,
  },
  
};
