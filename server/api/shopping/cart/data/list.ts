import { CartService } from "~~/server/core/service/cart"

export default defineWrappedRequiredAuthHandler(async (event) => {
  try {
    const cartService = new CartService(new UserAuthContext(event).getUserIdOrThrow())
    return await cartService.list()
  } catch (e) {
    console.log(e)
  }
})
