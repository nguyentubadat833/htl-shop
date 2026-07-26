import type { EventHandler, EventHandlerRequest } from "h3";
import { getStatusMessage } from "./error";
import { H3Event } from "h3";
import { ErrorResponse } from "~~/shared/types/app";

function handlerError(event: H3Event, err: unknown): ErrorResponse {
  if (err instanceof ServerError) {
    const statusCode = err.code;
    const statusMessage = getStatusMessage(statusCode);

    setResponseStatus(event, err.code, statusMessage);

    return {
      error: true,
      statusCode,
      statusMessage,
      message: err.message,
    } satisfies ErrorResponse;
  }

  setResponseStatus(event, 500);
  return {
    error: true,
    statusCode: 500,
    statusMessage: "UNKNOWN ERROR",
    message: "Unknown error",
  } satisfies ErrorResponse;
}

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      return await handler(event);
    } catch (err) {
      return handlerError(event, err);
    }
  });

export const defineWrappedRequiredAuthHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    const userContextService = new UserAuthContext(event);
    if (!userContextService.userAuth) {
      throw createError({
        statusCode: 401,
      });
    }

    try {
      return await handler(event);
    } catch (err) {
      return handlerError(event, err);
    }
  });

export const defineWrappedRequiredAdminHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    const userContextService = new UserAuthContext(event);
    if (!userContextService.userAuth) {
      throw createError({
        statusCode: 401,
      });
    }

    try {
      userContextService.hasAdminOrThrow();

      return await handler(event);
    } catch (err) {
      return handlerError(event, err);
    }
  });
