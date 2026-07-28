import { CartService } from "~~/server/core/service/cart";
import { CheckoutInCartSchema } from "#shared/schemas/cart";

export default defineWrappedRequiredAuthHandler(async (event) => {
  const { cardIds } = zodValidateRequestOrThrow(CheckoutInCartSchema, await readBody(event));

  const user = UserAuthContext.unwrapUserAuthContext(event);

  const cartService = new CartService(user.id);
  const { publicId: orderId } = await cartService.checkout(cardIds);
  return { orderId };
});
