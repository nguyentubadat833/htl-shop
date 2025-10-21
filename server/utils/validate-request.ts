import { ZodError, ZodType } from "zod";

export function zodValidateRequestOrThrow<T>(schema: ZodType<T>, data: unknown, onError?: (error: ZodError) => void): T {
    const result = schema.safeParse(data);

    if (!result.success) {
        console.error(result.error)
      throw createError(result.error.message)
    }

    return result.data
  }