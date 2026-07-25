import { OrderService } from "~~/server/core/service/order";
import { UserAuthContext } from "~~/server/utils/context-working";

export default defineWrappedRequiredAuthHandler(async (event) => {
  const user = UserAuthContext.unwrapUserAuthContext(event);
  return OrderService.getWithUserId(user.id);
});
