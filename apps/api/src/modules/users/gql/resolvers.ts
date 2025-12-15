import { UserService } from "@/modules/users/service";
import type { UserModel } from "../model";

export const resolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      return await UserService.getUserById(id);
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      { input }: { input: UserModel.SignUpRequestType }
    ) => {
      return await UserService.createUser(input);
    },
  },
};
