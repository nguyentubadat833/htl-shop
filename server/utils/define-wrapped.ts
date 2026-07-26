import type { EventHandler, EventHandlerRequest } from "h3";
import { getStatusMessage } from "./error";

function handlerError(err: unknown) {
  if (err instanceof ServerError) {
    throw createError({
      statusCode: err.code,
      statusMessage: err.message ?? getStatusMessage(err.code),
      statusText: err.message,
    });
  }

  throw createError({
    statusCode: 500,
    statusMessage: getStatusMessage(500),
  });
}

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      return handler(event);
    } catch (err) {
      handlerError(err);
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
      return handler(event);
    } catch (err) {
      handlerError(err);
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

      return handler(event);
    } catch (err) {
      handlerError(err);
    }
  });
