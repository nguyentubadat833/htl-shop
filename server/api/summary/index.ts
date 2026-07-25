export default defineWrappedRequiredAdminHandler(async () => {
  const [
    user_total,
    user_active_total,
    topUsersRaw,

    product_total,
    product_active_total,
    topPaidProductsRaw,
    topAddCartProductsRaw,

    order_total,
    order_paid_total,
  ] = await Promise.all([
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
          status: "PAID",
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
          status: "PAID",
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
        status: "PAID",
      },
    }),
  ]);

  const [users, products] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: {
          in: topUsersRaw.map((x) => x.userId),
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
          in: [
            ...new Set([
              ...topPaidProductsRaw.map((x) => x.productId),
              ...topAddCartProductsRaw.map((x) => x.productId),
            ]),
          ],
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
    ...users.find((u) => u.id === row.userId)!,
    purchaseCount: row._count.id,
  }));

  const top_paid_products = topPaidProductsRaw.map((row) => ({
    ...products.find((p) => p.id === row.productId)!,
    purchaseCount: row._count.id,
  }));

  const top_add_cart_products = topAddCartProductsRaw.map((row) => ({
    ...products.find((p) => p.id === row.productId)!,
    addToCartCount: row._count.id,
  }));

  return {
    user_total,
    user_active_total,
    top_users,

    product_total,
    product_active_total,
    top_paid_products,
    top_add_cart_products,

    order_total,
    order_paid_total,
  };
});