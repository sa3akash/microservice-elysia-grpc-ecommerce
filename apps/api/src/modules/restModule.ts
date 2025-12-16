import Elysia from "elysia";
import { users } from "./users";

export const restModules = new Elysia().use(users);
