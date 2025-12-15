
import { t } from "elysia";



export const errorResponse = t.Object({
  success: t.Boolean(),
  message: t.String(),
  code: t.String(),
});
