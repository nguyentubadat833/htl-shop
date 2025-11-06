import { CartService } from "~~/server/core/service/cart"
import { CartItemResponse } from "~~/shared/types/cart"

export default defineWrappedRequiredAuthHandler(async (event) => {
  const cartService = new CartService(new UserAuthContext(event).getUserIdOrThrow())
  return await cartService.list() satisfies CartItemResponse[]
})
