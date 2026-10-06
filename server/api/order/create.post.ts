import { CreateOrderSchema } from "#shared/schemas/order";
import { OrderService } from "~~/server/core/service/order";

export default defineWrappedRequiredAuthHandler(async (event) => {
  const req = zodValidateRequestOrThrow(CreateOrderSchema, await readBody(event));
  return await OrderService.create(new UserAuthContext(event).getUserIdOrThrow(), req.product_publicIds);
});
