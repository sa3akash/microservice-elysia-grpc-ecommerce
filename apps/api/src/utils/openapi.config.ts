import { config } from "@/config/dotenv";
import openapi from "@elysiajs/openapi";
import Elysia from "elysia";

const url = `http://localhost:${config.GATEWAY_PORT}`;

export const openapiMiddleware = new Elysia().use(
  openapi({
    documentation: {
      info: {
        title: "Ecommerce api OpenAPI",
        version: "1.0.0",
        description: `Ecommerce api OpenAPI Example and [graphql](${url}/graphql) and [explorer](https://studio.apollographql.com/sandbox/explorer?endpoint=${url}/graphql)`,
      },
    },
    exclude: {
      paths: ["/graphql", "/graphql-playground","/"],
    },
  })
);
