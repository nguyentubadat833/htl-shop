import { CartService } from "~~/server/core/service/cart";
import { CheckoutInCartSchema } from "~~/shared/schemas/cart";

export default defineWrappedRequiredAuthHandler(async (event) => {
  const { product_publicIds } = zodValidateRequestOrThrow(CheckoutInCartSchema, await readBody(event));

  const cartService = new CartService(new UserAuthContext(event).getUserIdOrThrow());
  const { publicId: orderId } = await cartService.checkout(product_publicIds);
  return { orderId };
});
