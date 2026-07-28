import { CartService } from "~~/server/core/service/cart";

export default defineWrappedRequiredAuthHandler(async (event) => {
  const user = UserAuthContext.unwrapUserAuthContext(event)

  const cartService = new CartService(user.id);
  return await cartService.list();
});
