import { UserService } from "@/modules/users/service";

export const resolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      return await UserService.getUserById(id);
    },
  },
};
