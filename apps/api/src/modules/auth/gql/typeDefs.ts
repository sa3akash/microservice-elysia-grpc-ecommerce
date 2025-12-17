import { gql } from "@elysiajs/apollo";

export const authTypeDefs = gql`
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

  type SignUpResponse {
    message: String!
    userId: String!
    email: String!
  }

  type Query {
    user(id: ID!): User
  }

  input SignUpInput {
    name: String!
    email: String!
    password: String!
    phone: String
  }

  input SignInInput {
    identifier: String!
    password: String!
  }

  union LoginResult = User | TwoFactorRequired

  type LoginResponse {
    result: LoginResult
  }

  type TwoFactorRequired {
    message: String!
    twoFactorSessionId: String!
    type: Int!
    deliveryMethod: Int!
    maskedTarget: String!
    expiresAt: String!
    codeLength: Int!
    canResend: Boolean!
    resendAfter: String!
  }

  type Mutation {
    createUser(input: SignUpInput): SignUpResponse
    login(input: SignInInput): LoginResponse
  }
`;
