import type { EventHandler, EventHandlerRequest } from "h3";
import { getStatusMessage, HttpStatus } from "./error";

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      const response = await handler(event);
      // return { response };
      return response;
    } catch (err) {
      if (err instanceof ServerError) {
        throw createError({
          statusCode: err.code,
          statusMessage: getStatusMessage(err.code),
        });
      }
      throw createError({
        statusCode: 500,
        statusMessage: getStatusMessage(500),
      });
    }
  });

export const defineWrappedRequiredAuthHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      UserAuthContext.hasAuthOrThrowInline(event)
      const response = await handler(event);
      // return { response };
      return response;
    } catch (err) {
      if (err instanceof ServerError) {
        throw createError({
          statusCode: err.code,
          statusMessage: getStatusMessage(err.code),
        });
      }
      throw createError({
        statusCode: 500,
        statusMessage: getStatusMessage(500),
      });
    }
  });


export const defineWrappedRequiredAdminHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      UserAuthContext.hasAdminOrThrowInline(event)
      const response = await handler(event);
      return response;
    } catch (err) {
      if (err instanceof ServerError) {
        throw createError({
          statusCode: err.code,
          statusMessage: getStatusMessage(err.code),
        });
      }
      throw createError({
        statusCode: 500,
        statusMessage: getStatusMessage(500),
      });
    }
  });

