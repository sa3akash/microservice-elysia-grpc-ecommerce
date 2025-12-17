
import type Elysia from "elysia";
import { getClientIp } from "./ip";

export const GlobalContext = (app: Elysia) =>
  app.derive(({ request, server }) => {
    return {
      ip: getClientIp(request, server),
    };
  });
