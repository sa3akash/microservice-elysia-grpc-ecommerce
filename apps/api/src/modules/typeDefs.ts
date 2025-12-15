import { gql } from "@elysiajs/apollo";
import { userTypeDefs } from "./users/gql/typeDefs";

const rootTypeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }

  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [rootTypeDefs, userTypeDefs];
