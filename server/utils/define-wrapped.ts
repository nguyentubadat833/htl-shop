import type { EventHandler, EventHandlerRequest } from "h3";
import { getStatusMessage } from "./error";
import { H3Event } from "h3";
import { getLocaleTime } from "./generate-values";
import { logErrorColor, logInfoColor } from "./log-helpers";
import { UserAuth } from "./context-working";

function handlerError(event: H3Event, err: unknown) {
  const request = getRequestURL(event);

  let errorInfo = `[${getLocaleTime()}] | [${event.context.id}] | RESPONSE ERROR`;

  const userAuth = event.context.userAuth as UserAuth;
  if (userAuth) {
    errorInfo = errorInfo + ` | [USER ${userAuth.email}]`;
  }

  if (err instanceof ServerError) {
    errorInfo = errorInfo + ` | ${err.message}`;
    logErrorColor(errorInfo);

    throw createError({
      statusCode: err.code,
      statusMessage: err.message ?? getStatusMessage(err.code),
      statusText: err.message,
    });
  }

  logErrorColor(errorInfo);

  throw createError({
    statusCode: 500,
    statusMessage: getStatusMessage(500),
  });
}

function handlerResponse(event: H3Event) {
  let message = `[${getLocaleTime()}] | [${event.context.id}] | RESPONSE OK   `;

  const userAuth = event.context.userAuth as UserAuth;
  if (userAuth) {
    message = message + ` | [USER ${userAuth.email}]`;
  }
  logInfoColor(message);
}

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      const response = await handler(event);
      handlerResponse(event);
      return response;
    } catch (err) {
      handlerError(event, err);
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
      const response = await handler(event);
      handlerResponse(event);
      return response;
    } catch (err) {
      handlerError(event, err);
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

      const response = await handler(event);
      handlerResponse(event);
      return response;
    } catch (err) {
      handlerError(event, err);
    }
  });
