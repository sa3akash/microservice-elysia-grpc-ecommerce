import Elysia from "elysia";
import { users } from "./users";
import { auth } from "./auth";

export const restModules = new Elysia().use(auth).use(users);
