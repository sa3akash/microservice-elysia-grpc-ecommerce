import Elysia from "elysia";
import { UserService } from "./service";
import { MyError } from "@/utils/customError";
import { UserModel } from "./model";

export const users = new Elysia({ prefix: "/users" })
.get(
  "/:id",
  async ({ params }) => {
    const response = await UserService.getUserById(params.id);

    if (!response) {
      throw new MyError("User not found", 404);
    }
    return response;
  },{
    params: UserModel.getUserParams,
  }
)
.post('/create',async ({body}) => {
  const response = await UserService.createUser(body);
  return response;
},{
  body: UserModel.signUpBody,
})
;
