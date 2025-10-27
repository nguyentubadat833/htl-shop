import { OrderService } from "~~/server/core/service/order";
import { AddOrderItemsSchema } from "~~/shared/schemas/order";

export default defineWrappedResponseHandler(async (event) => {
  const req = zodValidateRequestOrThrow(AddOrderItemsSchema, await readBody(event));

  const orderService = await new OrderService().withPublicId(req.publicId);
  await orderService.addItems(req.product_publicIds);
  setResponseStatus(event, 204);
  return;
});
