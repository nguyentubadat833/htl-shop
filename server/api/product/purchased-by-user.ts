import { orderPaidValues } from "~~/shared/constants/order.constants";
import { ProductPurchased } from "~~/shared/types/product";

export default defineWrappedRequiredAuthHandler(async (event) => {
  const user = UserAuthContext.unwrapUserAuthContext(event);
  
  const purchasedProducts = await prisma.cart.findMany({
    where: {
      order: {
        orderByUserId: user.id,
        status: { in: orderPaidValues },
      },
    },
    distinct: ["productId"],
    select: {
      product: {
        include: {
          files: {
            // where: {
            //   type: "IMAGE",
            // },
            select: {
              publicId: true,
              type: true,
            },
          },
        },
      },
      order: {
        select: {
          orderAt: true,
        },
      },
    },
    orderBy: [
      {
        order: {
          orderAt: "desc",
        },
      },
    ],
  });

  return purchasedProducts.map(
    (item) =>
      ({
        publicId: item.product.publicId,
        alias: item.product.alias,
        name: item.product.name,
        fileId: item.product.files.filter((item) => item.type === "DESIGN")[0]?.publicId,
        imageLinks: item.product.files
          .filter((item) => item.type === "IMAGE")
          .map((file) => file.publicId)
          .map((id) => `/storage/image?publicId=${id}`),
        purchasedAt: item.order!.orderAt.toISOString(),
      }) satisfies ProductPurchased,
  );
  //   return await prisma.$queryRaw<
  //     {
  //       id: number;
  //       public_id: string;
  //       alias: string;
  //       name: string;
  //       price: bigint;
  //     }[]
  //   >`
  // SELECT DISTINCT
  //     p.id,
  //     p.public_id,
  //     p.alias,
  //     p.name,
  //     p.price
  // FROM "order" o
  // JOIN cart c ON c.order_id = o.id
  // JOIN product p ON p.id = c.product_id
  // WHERE o.order_by_user_id = ${user.id}
  //   AND o.status IN ('PAID', 'SENDING', 'DELIVERED');
  // `;
});
