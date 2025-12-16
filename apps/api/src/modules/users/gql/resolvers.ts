import { UserService } from "@/modules/users/service";
import { UserModel } from "../model";
import { validate } from "@/utils/validation";
import { t } from "elysia";

export const userResolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      return await UserService.getUserById(id);
    },
  },
  Mutation: {
    createUser: validate(
      t.Object({ input: UserModel.signUpBody }),
      async (_: any, { input }: { input: UserModel.SignUpRequestType }) => {
        return await UserService.createUser(input);
      }
    ),
  },
};
