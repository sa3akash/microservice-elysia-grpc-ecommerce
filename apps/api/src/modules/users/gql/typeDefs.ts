import { gql } from "@elysiajs/apollo";

export const userTypeDefs = gql`
  type Preferences {
    language: String
    theme: String
  }

  # enum Role {
  #   USER
  #   ADMIN
  #   MODERATOR
  # }

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

  extend type Query {
    user(id: ID!): User
  }

  input SignUpRequestType {
    name: String!
    email: String!
    password: String!
    phone: String
  }

  extend type Mutation {
    createUser(input: SignUpRequestType): User
  }
`;
