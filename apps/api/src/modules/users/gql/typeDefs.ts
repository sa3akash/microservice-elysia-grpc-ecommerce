import { gql } from "@elysiajs/apollo";

export const userTypeDefs = gql`
  type Preferences {
    language: String
    theme: String
  }

  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    role: String!
    avatar: String
    isVerified: Boolean!
    isActive: Boolean!
    preferences: Preferences
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    user(id: ID!): User
  }

  input SignUpRequestType {
    name: String!
    email: String!
    password: String!
    phone: String
  }

  type Mutation {
    createUser(input: SignUpRequestType): User
  }
`;
