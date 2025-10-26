export type ErrorType = "validate" | "prisma" | "logic" | "auth";

export class ServerError extends Error {
  constructor(
    message: string,
    public errorType: ErrorType,
  ) {
    super(message);
  }
}
