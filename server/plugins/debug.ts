import { ErrorResponse } from "~~/shared/types/app";
import { isErrorStatus } from "../utils/error";

export default defineNitroPlugin((nitroApp) => {
  // nitroApp.hooks.hook("request", (event) => {
  //   const idRequest = generateRequestId();

  //   const requestURL = getRequestURL(event);
  //   const method = event.method;

  //   event.context.id = idRequest;

  //   logInfoColor(`[${getLocaleTime()}] | [${idRequest}] | REQUEST        | [${method}] ${requestURL.pathname}`);
  // });

  // nitroApp.hooks.hook("error", (error, { event }) => {
  //   if (event) {
  //     let errorInfo = `[${getLocaleTime()}]`;

  //     const userAuth = event.context.userAuth as UserAuth;
  //     if (userAuth) {
  //       errorInfo = errorInfo + ` | [USER ${userAuth.email}]`;
  //     }

  //     errorInfo = errorInfo + ` | [ERROR ${error.message ?? error.name ?? error.stack?.slice(0, 50)}]}`;
  //     logErrorColor(errorInfo);
  //   }
  // });

  nitroApp.hooks.hook("afterResponse", (event, response) => {
    const requestURL = getRequestURL(event);
    const pathname = requestURL.pathname;

    const clientHost = getRequestIP(event, { xForwardedFor: true }) ?? getRequestHost(event);
    const userAgent = getRequestHeader(event, 'user-agent')

    if (pathname.startsWith("/_nuxt") || pathname.startsWith("/api/_nuxt") || pathname.startsWith("/storage/image")) return;

    let message = `[${getLocaleTime()}] # [${clientHost}] # [${getClientName(userAgent)}] # [${pathname}]`;
    const userAuth = event.context.userAuth as UserAuth;
    if (userAuth) {
      message = message + ` # [${userAuth.email}]`;
    }

    const responseStatus = getResponseStatus(event);
    if (isErrorStatus(responseStatus)) {
      const responseData = response?.body as ErrorResponse | undefined;
      const responseMessage = responseData?.message ?? responseData?.statusMessage ?? responseData?.statusCode ?? "Unknown Error";

      message = message + ` # [${responseMessage}]`;
      logErrorColor(message);
      return;
    }

    logInfoColor(message);
  });
});
