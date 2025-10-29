import { ZodError, ZodType } from "zod";
import { ServerError } from "./error";

export function zodValidateRequestOrThrow<T>(schema: ZodType<T>, data: unknown, onError?: (error: ZodError) => void): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(result.error);
    throw new ServerError(result.error.issues[0].message, 400, "validate");
  }

  return result.data;
}
