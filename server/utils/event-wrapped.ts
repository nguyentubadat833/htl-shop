import type { EventHandler, EventHandlerRequest } from "h3";
import { getStatusMessage } from "./error";
import { H3Event } from "h3";
import { ErrorResponse } from "~~/shared/types/app";
import { UserRole } from "~~/prisma/generated/enums";

function handlerError(event: H3Event, err: unknown): ErrorResponse {
  console.log(err)
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

    const user = UserAuthContext.unwrapUserAuthContext(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Required auth",
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

    const user = UserAuthContext.unwrapUserAuthContext(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Required auth",
      });
    }

    if (user.role !== UserRole.ADMIN) {
      throw createError({
        statusCode: 403,
        statusMessage: "Required role",
      });
    }

    try {
      return await handler(event);
    } catch (err) {
      return handlerError(event, err);
    }
  });
