import { OrderService } from "~~/server/core/service/order";
import { CreatePaymentSchema } from "~~/shared/schemas/payment";

export default defineWrappedRequiredAuthHandler(async event => {
  const { order_id, success_url, cancel_url, error_url } = zodValidateRequestOrThrow(CreatePaymentSchema, getQuery(event));
  validatePaymentRedirects(event, [success_url, cancel_url, error_url]);
  const userId = new UserAuthContext(event).getUserIdOrThrow();
  const order = await prisma.order.findFirst({ where: { publicId: order_id, orderByUserId: userId } });
  if (!order) throw new ServerError("Order not found", 404);
  if (order.amount !== 0) throw new ServerError("Order is not free", 400);
  if (["PAID", "SENDING", "DELIVERED"].includes(order.status)) return sendRedirect(event, success_url);
  if (order.status !== "PENDING") throw new ServerError("Order is not pending", 409);
  const claimed = await prisma.order.updateMany({
    where: { id: order.id, status: "PENDING", amount: 0 },
    data: { status: "PAID" },
  });
  if (claimed.count) {
    // Payment remains recorded if email delivery fails; downloads are still in the library.
    await OrderService.sendProduct(order.publicId).catch(() => console.error("[Delivery] Free order email failed"));
  }
  return sendRedirect(event, success_url);
});
