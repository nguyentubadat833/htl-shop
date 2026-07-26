export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    const idRequest = generateRequestId();

    const requestURL = getRequestURL(event);
    const method = event.method;

    event.context.id = idRequest;

    logInfoColor(`[${getLocaleTime()}] | [${idRequest}] | REQUEST        | [${method}] ${requestURL.pathname}`);
  });

  nitroApp.hooks.hook("error", (error, { event }) => {
    if (event) {
      let errorInfo = `[${getLocaleTime()}] | [${event.context.id}] | RESPONSE ERROR`;

      const userAuth = event.context.userAuth as UserAuth;
      if (userAuth) {
        errorInfo = errorInfo + ` | [USER ${userAuth.email}]`;
      }

      errorInfo = errorInfo + ` | [ERROR ${error.message ?? error.name ?? error.stack?.slice(0, 50)}]}`;
      logErrorColor(errorInfo);
    }
  });

  nitroApp.hooks.hook("afterResponse", (event) => {
   let message = `[${getLocaleTime()}] | [${event.context.id}] | RESPONSE OK   `;
   
     const userAuth = event.context.userAuth as UserAuth;
     if (userAuth) {
       message = message + ` | [USER ${userAuth.email}]`;
     }  
     logInfoColor(message);
  });
});
