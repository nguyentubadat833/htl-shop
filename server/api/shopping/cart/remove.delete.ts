import { CartService } from "~~/server/core/service/cart";
import { RemoveProductsInCartSchema } from "#shared/schemas/cart";

export default defineWrappedRequiredAuthHandler(async (event) => {
  const { product_publicIds } = zodValidateRequestOrThrow(RemoveProductsInCartSchema, await readBody(event));
  
  const cartService = new CartService(new UserAuthContext(event).getUserIdOrThrow());
  await cartService.removeProducts(product_publicIds);
  return;
});
