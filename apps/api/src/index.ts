import { Elysia } from "elysia";
import { typeDefs } from "./modules/typeDefs";
import { resolvers } from "./modules/resolvers";
import { apollo } from "@elysiajs/apollo";
import { cors } from "@elysiajs/cors";
import { modules } from "./modules/module";
import { config } from "./config/dotenv";

const app = new Elysia()
  .use(cors())
  .use(
    apollo({
      typeDefs,
      resolvers,
    })
  )
  .get("/", ({ redirect }) => {
    return redirect("/openapi");
  })
  .get("/health", () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.version,
      pid: process.pid,
    };
  })
  .use(modules)
  .listen(config.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
