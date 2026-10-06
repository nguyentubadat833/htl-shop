import { OrderService } from '~~/server/core/service/order';
import { AddProductToCartSchema } from '#shared/schemas/cart';

export default defineWrappedRequiredAuthHandler(async event => {
  const { product_publicId } = zodValidateRequestOrThrow(AddProductToCartSchema, await readBody(event));
  const user = UserAuthContext.unwrapUserAuthContext(event);
  const { orderId, created } = await OrderService.recordFreeDownload(user.id, product_publicId);
  if (created) {
    await OrderService.sendProduct(orderId).catch(() => console.error('[Delivery] Free order email failed'));
  }
  return { orderId };
});
