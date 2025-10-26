import type { EventHandler, EventHandlerRequest } from "h3";

type UserAuth = {
  id: number;
  publicId: string;
  email: string;
  name: string;
};

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      const response = await handler(event);
      return { response };
    } catch (err) {
      // Error handling
      return { err };
    }
  });

export class UserAuthContext {
  constructor() {}

  static get h3Event(){
    return useEvent()
  }

  static set setUserAuth(user: UserAuth) {
    this.h3Event.context.userAuth = user;
  }

  static get userAuth(): UserAuth {
    return this.h3Event.context.userAuth;
  }

  static get getUserAuthOrThrow(){
    if(!this.userAuth){
      throw createError({
        statusCode: 401,
      })
    }
    return this.userAuth
  }
}
