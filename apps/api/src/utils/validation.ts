import { Value } from "@sinclair/typebox/value";
import { GraphQLError } from "graphql";
import type { TSchema } from "@sinclair/typebox";

export const validate = <T extends TSchema>(
  schema: T,
  resolver: (root: any, args: any, context: any, info: any) => any
) => {
  return async (root: any, args: any, context: any, info: any) => {
    if (!Value.Check(schema, args)) {
      const errors = [...Value.Errors(schema, args)].map((error) => ({
        path: error.path,
        message: error.message,
        value: error.value,
      }));

      const message =
        [...Value.Errors(schema, args)]
          .map((error) => error.schema.error)[0]
          ?.toString() || "Invalid input";

      throw new GraphQLError(message, {
        extensions: {
          code: "BAD_USER_INPUT",
          errors,
        },
      });
    }

    return resolver(root, args, context, info);
  };
};
