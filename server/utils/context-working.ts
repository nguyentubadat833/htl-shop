import { UserRole } from "@prisma/client";
import type { EventHandlerRequest, H3Event } from "h3";

export type UserAuth = {
  id: number;
  publicId: string;
  email: string;
  role?: UserRole;
};

export class UserAuthContext {
  constructor(public event: H3Event<EventHandlerRequest>) {}

  set userAuth(user: UserAuth) {
    this.event.context.userAuth = user;
  }

  get userAuth(): UserAuth | null {
    return this.event.context?.userAuth ?? null;
  }

  getUserAuthOrThrow() {
    if (!this.userAuth) {
      throw createError({
        statusCode: 401,
      });
    }
    return this.userAuth;
  }

  getUserIdOrThrow() {
    return this.getUserAuthOrThrow().id;
  }

  hasAdminRole() {
    return this.getUserAuthOrThrow().role === UserRole.ADMIN;
  }

  hasAdminOrThrow() {
    if (!this.hasAdminRole()) {
      throw createError({
        statusCode: 403,
      });
    }
  }

  static hasAdminOrThrowInline(event: H3Event<EventHandlerRequest>) {
    const userAuthContext = new UserAuthContext(event);
    userAuthContext.hasAdminOrThrow();
    return userAuthContext;
  }
}
