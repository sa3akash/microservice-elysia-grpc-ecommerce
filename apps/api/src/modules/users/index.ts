import Elysia from "elysia";
import { UserService } from "./service";

export const users = new Elysia({ prefix: '/users' })
    .get('/:id', async ({ params }) => {
       const response = await UserService.getUserById(params.id) 

       if (!response) {
        return {
            error: 'User not found'
        }
       }
       return response

    })
