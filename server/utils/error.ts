export type ErrorType = "validate" | "prisma" | "logic" | "auth";

export const HttpStatus = {
  // 1xx – Informational
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",

  // 2xx – Success
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  206: "Partial Content",

  // 3xx – Redirection
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",

  // 4xx – Client Error
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  413: "Payload Too Large",
  415: "Unsupported Media Type",
  422: "Unprocessable Entity",
  429: "Too Many Requests",

  // 5xx – Server Error
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
} as const;

export type HttpStatusCode = keyof typeof HttpStatus;

export function getStatusMessage(code: number): string {
  return HttpStatus[code as HttpStatusCode] || "Unknown Status";
}

export class ServerError extends Error {
  constructor(
    message: string,
    public code: HttpStatusCode,
    public errorType: ErrorType,
  ) {
    super(message);
  }
}
