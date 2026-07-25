import z from "zod";
import { getAmountVND } from "~~/server/core/service/money";
import { OrderService } from "~~/server/core/service/order";

  type OrderData = {
    id: bigint
    publicId: string
    currency: string
    amount: number
    status: string
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
  if (order.status === "PAID" || order.status === "DELIVERED") {
    return { success: true };
  }

  // Trả response ngay sau khi đã có đủ dữ liệu tối thiểu để xác nhận hợp lệ
  // Xử lý phần còn lại (quy đổi tiền tệ, update DB, gửi hàng) ở background
  processIpnAsync(order, data).catch((err) => {
    console.error("IPN processing failed", { orderId: order.id, err });
  });

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

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      payments: {
        create: [
          {
            amount: ipnTransaction.transaction_amount,
            method: ipnTransaction.payment_method,
            status: "SUCCESS",
            metadata: data,
          },
        ],
      },
    },
  });

  await OrderService.sendProduct(order.publicId);
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "DELIVERED" },
  });
}

// export default defineWrappedResponseHandler(async (event) => {
//   const body = await readBody(event);

//   const parseBody = ipnSchema.safeParse(body);
//   if (!parseBody.success) {
//     throw createError({
//       statusCode: 500,
//     });
//   }

//   const data = parseBody.data;
//   const ipnOrder = data.order;
//   const ipnTransaction = data.transaction;

//   const order = await prisma.order.findFirstOrThrow({
//     where: {
//       publicId: ipnOrder.order_invoice_number,
//     },
//     select: {
//       id: true,
//       publicId: true,
//       currency: true,
//       amount: true,
//     },
//   });

//   let orderAmount = order.amount;
//   if (order.currency === "USD" && ipnTransaction.transaction_currency === "VND") {
//     orderAmount = await getAmountVND(orderAmount);
//   } else {
//     console.trace("Not support");
//     throw createError({
//       statusCode: 409,
//     });
//   }

//   if (data.notification_type === "ORDER_PAID") {
//     const validAmount = Number(orderAmount) === Number(ipnTransaction.transaction_amount);
//     const validTransaction = ipnOrder.order_status === "CAPTURED" && ipnTransaction.transaction_type === "PAYMENT" && ipnTransaction.transaction_status === "APPROVED";
//     if (validAmount && validTransaction) {
//       await prisma.order.update({
//         where: {
//           id: order.id,
//         },
//         data: {
//           status: "PAID",
//           payments: {
//             create: [
//               {
//                 amount: ipnTransaction.transaction_amount,
//                 method: ipnTransaction.payment_method,
//                 status: "SUCCESS",
//                 metadata: data,
//               },
//             ],
//           },
//         },
//       });

//       OrderService.sendProduct(order.publicId).then(() => {
//         prisma.order.update({
//           where: {
//             id: order.id,
//           },
//           data: {
//             status: "DELIVERED",
//           },
//         });
//       });
//     }
//   }

//   return {
//     success: true,
//   };
// });
