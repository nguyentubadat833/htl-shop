import { generateRequestId, getLocaleTime } from "../utils/generate-values";
import { logInfoColor } from "../utils/log-helpers";

export default defineEventHandler(async (event) => {
  const id = generateRequestId();

  const requestURL = getRequestURL(event);
  const method = event.method;
  logInfoColor(`[${getLocaleTime()}] | [${id}] | REQUEST        | [${method}] ${requestURL.pathname}`);

  event.context.id = id;
});
