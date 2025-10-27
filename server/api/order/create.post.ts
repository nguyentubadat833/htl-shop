import { CreateOrderSchema } from "#shared/schemas/order";
import { OrderService } from "~~/server/core/service/order";
export default defineWrappedResponseHandler(async (event) => {
  const req = zodValidateRequestOrThrow(CreateOrderSchema, await readBody(event));
  return await OrderService.create(UserAuthContext.getUserAuthOrThrow.id, req.product_publicIds);
});
