import { OrderService } from "~~/server/core/service/order";
import { CancelOrderSchema } from "#shared/schemas/order";

export default defineWrappedRequiredAuthHandler(async (event) => {
  const req = zodValidateRequestOrThrow(CancelOrderSchema, await readBody(event));

  const orderService = await new OrderService().withPublicId(req.publicId);
  const user = new UserAuthContext(event).getUserAuthOrThrow();
  if (orderService.order.orderByUserId !== user.id && user.role !== "ADMIN") throw new ServerError("Order not found", 404);
  await orderService.cancel();
  setResponseStatus(event, 204);
  return;
});
