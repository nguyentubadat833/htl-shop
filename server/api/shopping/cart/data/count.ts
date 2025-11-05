import { CartService } from "~~/server/core/service/cart"

export default defineWrappedRequiredAuthHandler(async (event) => {
  const cartService = new CartService(new UserAuthContext(event).getUserIdOrThrow())
  return await cartService.count() as number
})
