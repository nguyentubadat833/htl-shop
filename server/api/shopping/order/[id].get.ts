import z from "zod";
import { orderPaidValues } from "~~/shared/constants/order.constants";
import { OrderWithProductsResponse } from "~~/shared/types/order";

const Schema = z.object({
  id: z.string(),
});

export default defineWrappedRequiredAuthHandler(async (event) => {
  const { id } = zodValidateRequestOrThrow(Schema, getRouterParams(event));

  const user = UserAuthContext.unwrapUserAuthContext(event)

  const order = await prisma.order.findUnique({
    where: { publicId: id },
    select: {
      id: true,
      publicId: true,
      status: true,
      amount: true,
      orderAt: true,
      orderByUserId: true
      // items: {
      //   select: {
      // product: {
      //   select: {
      //     alias: true,
      //     name: true,
      //     price: true,
      //   },
      // },
      //   },
      // },
    },
  });

  if (!order) {
    throw new ServerError(HttpStatus[404], 404);
  }

  if(user.id !== order.orderByUserId){
    throw new ServerError(HttpStatus[404], 404)
  }

  const items = await prisma.cart.findMany({
    where: {
      orderId: order.id,
    },
    select: {
      product: {
        select: {
          alias: true,
          name: true,
          price: true,
        },
      },
    },
  });

  return {
    publicId: order.publicId,
    status: order.status,
    amount: order.amount,
    orderAt: order.orderAt.toISOString(),
    products: items.map((item) => {
      return {
        name: item.product.name,
        price: item.product.price,
      };
    }),
    paid: orderPaidValues.includes(order.status),
  } satisfies OrderWithProductsResponse

  // return await OrderService.getWithProducts(id);
});
