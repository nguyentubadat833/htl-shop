import { OrderService } from "~~/server/core/service/order";
import { RemoveOrderItemsSchema } from "~~/shared/schemas/order";

export default defineWrappedResponseHandler(async (event) => {
  const req = zodValidateRequestOrThrow(RemoveOrderItemsSchema, await readBody(event));

  const orderService = await new OrderService().withPublicId(req.publicId);
  await orderService.removeItems(req.product_publicIds);
  setResponseStatus(event, 204);
  return;
});
