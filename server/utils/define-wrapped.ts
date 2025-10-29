import type { EventHandler, EventHandlerRequest } from "h3";
import { getStatusMessage, HttpStatus } from "./error";

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      const response = await handler(event);
      // return { response };
      return response
    } catch (err) {
      if (err instanceof ServerError) {
        throw createError({
          statusCode: err.code,
          statusMessage: getStatusMessage(err.code),
        });
      }
      console.log(err);
      throw createError({
        statusCode: 500,
        statusMessage: getStatusMessage(500),
      });
    }
  });
