import { OrderService } from "~~/server/core/service/order";
import { CancelOrderSchema } from "#shared/schemas/order";

export default defineWrappedResponseHandler(async (event) => {
  const req = zodValidateRequestOrThrow(CancelOrderSchema, await readBody(event));

  const orderService = await new OrderService().withPublicId(req.publicId);
  await orderService.cancel();
  setResponseStatus(event, 204);
  return;
});
