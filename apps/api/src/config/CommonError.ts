import { t } from "elysia";

export namespace CustomError {
  export const errorResponse = t.Object({
    success: t.Boolean(),
    message: t.String(),
    code: t.String(),
  });
}
