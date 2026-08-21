import { ErrorResponse } from "~~/shared/types/app";
import { isErrorStatus } from "../utils/error";
import { logger } from "../utils/logger";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("afterResponse", (event, response) => {
    const requestURL = getRequestURL(event);
    const pathname = requestURL.pathname;

    const clientHost = getRequestIP(event, { xForwardedFor: true }) ?? getRequestHost(event);
    const userAgent = getRequestHeader(event, "user-agent");

    if (pathname.startsWith("/_") || pathname.startsWith("/api/_nuxt") || pathname.startsWith("/storage/image")) return;

    // let message = `[${getLocaleTime()}] # [${clientHost}] # [${getClientName(userAgent)}] # [${pathname}]`;
    let message = `[${clientHost}] # [${getClientName(userAgent)}] # [${pathname}]`;
    const userAuth = event.context.userAuth as UserAuth;
    if (userAuth) {
      message = message + ` # [${userAuth.email}]`;
    }

    const responseStatus = getResponseStatus(event);
    if (isErrorStatus(responseStatus)) {
      const responseData = response?.body as ErrorResponse | undefined;
      const responseMessage = responseData?.message ?? responseData?.statusMessage ?? responseData?.statusCode ?? "Unknown Error";

      message = message + ` # [${responseMessage}]`;
      // logErrorColor(message);
      logger.error(message);
      return;
    }

    // logInfoColor(message);
    logger.info(message);
  });
});
