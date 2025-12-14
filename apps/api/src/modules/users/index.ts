import Elysia from "elysia";

export const users = new Elysia({ prefix: '/users' })
    .get('/', () => 'Hello World')

    
