import Elysia from "elysia";
import { users } from "./users";
import { openapiMiddleware } from "@/utils/openapi.config";

export const modules = new Elysia().use(openapiMiddleware).use(users);
