import { AddProductToCartSchema } from "#shared/schemas/cart";
import { CartService } from "~~/server/core/service/cart";

export default defineWrappedRequiredAuthHandler(async (event) => {
  const { product_publicId } = zodValidateRequestOrThrow(AddProductToCartSchema, await readBody(event));

  const user = UserAuthContext.unwrapUserAuthContext(event);

  const cartService = new CartService(user.id);
  const cartId = await cartService.addProduct(product_publicId);
  return {
    id: cartId,
  };
});
