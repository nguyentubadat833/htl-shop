import { OrderStatus } from "~~/prisma/generated/enums";

const SUCCESS_ORDER_STATUSES: OrderStatus[] = ["PAID", "SENDING", "DELIVERED"] as const;

export default defineWrappedRequiredAdminHandler(async () => {
  const revenueByMonth = prisma.$queryRaw<
    {
      year: number;
      month: number;
      total_orders: bigint;
      total_customers: bigint;
      total_products: bigint;
      total_revenue: number;
    }[]
  >`
SELECT
    EXTRACT(YEAR FROM o.order_at)::int  AS year,
    EXTRACT(MONTH FROM o.order_at)::int AS month,

    COUNT(DISTINCT o.id)                  AS total_orders,
    COUNT(DISTINCT o.order_by_user_id)    AS total_customers,
    COUNT(c.id)                           AS total_products,
    COALESCE(SUM(o.amount), 0)            AS total_revenue

FROM "order" o
JOIN cart c
    ON c.order_id = o.id

WHERE o.status IN ('PAID', 'SENDING', 'DELIVERED')

GROUP BY
    year,
    month

ORDER BY
    year,
    month;
`;

  const [
    revenue_by_month,
    user_total,
    user_active_total,
    topUsersRaw,
    product_total,
    product_active_total,
    topPaidProductsRaw,
    topAddCartProductsRaw,
    order_total,
    order_success_total,
  ] = await Promise.all([
    revenueByMonth,

    prisma.user.count(),

    prisma.user.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.cart.groupBy({
      by: ["userId"],
      where: {
        order: {
          status: {
            in: SUCCESS_ORDER_STATUSES,
          },
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    }),

    prisma.product.count(),

    prisma.product.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.cart.groupBy({
      by: ["productId"],
      where: {
        order: {
          status: {
            in: SUCCESS_ORDER_STATUSES,
          },
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    }),

    prisma.cart.groupBy({
      by: ["productId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    }),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: {
          in: SUCCESS_ORDER_STATUSES,
        },
      },
    }),
  ]);

  const [users, products] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: {
          in: topUsersRaw.map((row) => row.userId),
        },
      },
      select: {
        id: true,
        publicId: true,
        name: true,
        email: true,
        image: true,
      },
    }),

    prisma.product.findMany({
      where: {
        id: {
          in: [...new Set([...topPaidProductsRaw.map((row) => row.productId), ...topAddCartProductsRaw.map((row) => row.productId)])],
        },
      },
      select: {
        id: true,
        publicId: true,
        alias: true,
        name: true,
        price: true,
        currency: true,
        status: true,
      },
    }),
  ]);

  const top_users = topUsersRaw.map((row) => ({
    ...users.find((user) => user.id === row.userId)!,
    purchaseCount: row._count.id,
  }));

  const top_paid_products = topPaidProductsRaw.map((row) => ({
    ...products.find((product) => product.id === row.productId)!,
    purchaseCount: row._count.id,
  }));

  const top_add_cart_products = topAddCartProductsRaw.map((row) => ({
    ...products.find((product) => product.id === row.productId)!,
    addToCartCount: row._count.id,
  }));

  return {
    revenue_by_month: revenue_by_month.map((x) => ({
      year: Number(x.year),
      month: Number(x.month),
      total_orders: Number(x.total_orders),
      total_customers: Number(x.total_customers),
      total_products: Number(x.total_products),
      total_revenue: Number(x.total_revenue),
    })),
    //
    user_total,
    user_active_total,
    top_users,

    product_total,
    product_active_total,
    top_paid_products,
    top_add_cart_products,

    order_total,
    order_success_total,
  };
});
