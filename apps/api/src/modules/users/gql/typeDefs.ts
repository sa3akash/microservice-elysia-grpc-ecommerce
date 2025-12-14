import { gql } from "@elysiajs/apollo";

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String
    email: String
  }

  extend type Query {
    user(id: ID!): User
  }
`;
