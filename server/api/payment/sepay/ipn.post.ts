import z from "zod";
import { getAmountVND } from "~~/server/core/service/money";
import { OrderService } from "~~/server/core/service/order";

  type OrderData = {
    id: bigint
    publicId: string
    currency: string
    amount: number
    status: "PENDING" | "PAID" | "SENDING" | "DELIVERED" | "CANCELLED"
  }

const ipnSchema = z.object({
  notification_type: z.enum(["ORDER_PAID", "TRANSACTION_VOID"]),
  order: z.object({
    order_status: z.enum(["CAPTURED", "CANCELLED", "AUTHENTICATION_NOT_NEEDED"]),
    order_currency: z.string(),
    order_invoice_number: z.string(),
    order_description: z.string(),
  }),
  transaction: z.object({
    transaction_id: z.string(),
    payment_method: z.string(),
    transaction_type: z.enum(["PAYMENT", "REFUND"]),
    transaction_status: z.enum(["APPROVED", "DECLINED"]),
    transaction_amount: z.string().transform(Number),
    transaction_currency: z.string(),
  }),
});

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);

  const parseBody = ipnSchema.safeParse(body);
  if (!parseBody.success) {
    throw createError({ statusCode: 500 });
  }

  const data = parseBody.data;
  const ipnOrder = data.order;
  // const ipnTransaction = data.transaction;

  // Lookup nhanh, chỉ để xác nhận order tồn tại + tránh xử lý trùng
  const order = await prisma.order.findFirstOrThrow({
    where: { publicId: ipnOrder.order_invoice_number },
    select: { id: true, publicId: true, currency: true, amount: true, status: true },
  });

  // Idempotency: nếu đã xử lý rồi thì trả về ngay, không làm lại
  if (order.status === "PAID" || order.status === "SENDING" || order.status === "DELIVERED") {
    return { success: true };
  }

  // Acknowledge only after payment persistence succeeds, so the gateway can retry failures.
  await processIpnAsync(order, data);

  return { success: true };
});

async function processIpnAsync(order: OrderData, data: z.infer<typeof ipnSchema>) {
  const ipnOrder = data.order;
  const ipnTransaction = data.transaction;

  let orderAmount = order.amount;
  if (order.currency === "USD" && ipnTransaction.transaction_currency === "VND") {
    orderAmount = await getAmountVND(orderAmount); // nên có cache tỷ giá bên trong hàm này
  } else {
    console.trace("Not support");
    return;
  }

  if (data.notification_type !== "ORDER_PAID") return;

  const validAmount = Number(orderAmount) === Number(ipnTransaction.transaction_amount);
  const validTransaction = ipnOrder.order_status === "CAPTURED" && ipnTransaction.transaction_type === "PAYMENT" && ipnTransaction.transaction_status === "APPROVED";

  if (!validAmount || !validTransaction) return;

  const claimed = await prisma.$transaction(async tx => {
    const result = await tx.order.updateMany({
      where: { id: order.id, status: order.status },
      data: { status: "PAID" },
    });
    if (!result.count) return false;
    await tx.payment.create({
      data: {
        orderId: order.id,
        transactionId: ipnTransaction.transaction_id,
        amount: ipnTransaction.transaction_amount,
        method: ipnTransaction.payment_method,
        status: "SUCCESS",
        metadata: data,
      },
    });
    return true;
  });
  if (!claimed) return;

  await OrderService.sendProduct(order.publicId).catch(() => console.error("[Delivery] Paid order email failed"));
  // Email delivery may be retried by the admin; the paid order remains accessible in the library.
}
