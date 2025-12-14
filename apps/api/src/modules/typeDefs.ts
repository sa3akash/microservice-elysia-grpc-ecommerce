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
`;

export const typeDefs = [rootTypeDefs, userTypeDefs];
