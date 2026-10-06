import type { OrderWithProductsResponse } from "#shared/types/order";
import type { Order } from "~~/prisma/generated/client";
import { Mail } from "~~/server/core/service/mail";
import { orderPaidValues } from "~~/shared/constants/order.constants";


export class OrderService {
  order!: Order;
  constructor(order?: Order) {
    if (order) {
      this.order = order;
    }
  }

  async withPublicId(orderPublicId: string) {
    this.order = await prisma.order.findUniqueOrThrow({
      where: { publicId: orderPublicId },
    });
    return this;
  }

  static async getWithProducts(orderPublicId: string): Promise<OrderWithProductsResponse> {
    const data = await prisma.order.findUniqueOrThrow({
      where: { publicId: orderPublicId },
      select: {
        publicId: true,
        status: true,
        amount: true,
        orderAt: true,
        items: {
          select: {
            price: true,
            product: {
              select: {
                alias: true,
                name: true,
                price: true,
              },
            },
          },
        },
        // _count: {
        //   select: {
        //     payments: {
        //       where: {
        //         status: "SUCCESS",
        //       },
        //     },
        //   },
        // },
      },
    });

    if (!data) {
      throw new ServerError(HttpStatus[404], 404);
    }

    const { publicId, status, amount, items, orderAt } = data;
    return {
      publicId,
      status,
      amount,
      orderAt: orderAt.toISOString(),
      products: items.map((item) => {
        return {
          name: item.product.name,
          price: item.price,
        };
      }),
      paid: orderPaidValues.includes(status),
    };
  }

  static async getWithUserId(userId: number): Promise<OrderWithProductsResponse[]> {
    const orders = await prisma.order.findMany({
      where: {
        orderByUserId: userId,
      },
      orderBy: {
        orderAt: "desc",
      },
      select: {
        publicId: true,
        status: true,
        amount: true,
        orderAt: true,
        items: {
          select: {
            price: true,
            product: {
              select: {
                alias: true,
                name: true,
                price: true,
              },
            },
          },
        },
        // _count: {
        //   select: {
        //     payments: {
        //       where: {
        //         status: "SUCCESS",
        //       },
        //     },
        //   },
        // },
      },
    });

    return orders.map(({ publicId, status, amount, items, orderAt }) => ({
      publicId,
      status,
      amount,
      orderAt: orderAt.toISOString(),
      products: items.map((item) => ({
        alias: item.product.alias,
        name: item.product.name,
        price: item.price,
      })),
      // paid: _count.payments > 0,
      paid: orderPaidValues.includes(status),
    }));
  }

  static async create(orderByUserId: number, cardIds: string[], currency: "VND" | "USD" = "USD") {
    const ids = [...new Set(cardIds)];
    if (!ids.length) throw new ServerError("Select at least one cart item", 400, "logic");
    return prisma.$transaction(async tx => {
      const items = await tx.cart.findMany({
        where: { id: { in: ids }, userId: orderByUserId, orderId: null },
        include: { product: { select: { status: true, price: true } } },
      });
      if (items.length !== ids.length) throw new ServerError("Cart items are unavailable", 409, "logic");
      if (items.some(item => item.product.status !== "ACTIVE")) throw new ServerError("Product required active", 409, "logic");
      const order = await tx.order.create({
        data: {
          orderByUserId,
          amount: items.reduce((sum, item) => sum + item.product.price, 0),
          currency,
        },
      });
      // Claim only unassigned rows: a simultaneous checkout cannot move rows from another order.
      for (const item of items) {
        const claimed = await tx.cart.updateMany({
          where: { id: item.id, userId: orderByUserId, orderId: null },
          data: { orderId: order.id, price: item.product.price },
        });
        if (claimed.count !== 1) throw new ServerError("Cart changed; please retry", 409, "logic");
      }
      return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } });
    });
  }

  static async sendProduct(orderPublicId: string) {
    const order = await prisma.order.findUniqueOrThrow({
      where: {
        publicId: orderPublicId,
      },
      select: {
        status: true,
        orderByUser: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            price: true,
            product: {
              select: {
                name: true,
                plan: true,
                externalLink: true,
                files: {
                  where: {
                    type: "DESIGN",
                  },
                  select: {
                    id: true,
                    // type: true,
                    // objectName: true,
                    // bucket: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!orderPaidValues.includes(order.status)) throw new ServerError("Order must be paid before delivery", 409, "logic");

    if (order.items.find((item) => item.product.plan === "PRO" && !item.product.files.length)) {
      throw new ServerError("Missing design file", 409, "logic");
    }

    const productListText = order.items.map((item, index) => `${index + 1}. ${item.product.name}${item.product.plan === "FREE" && item.product.externalLink ? ` — ${item.product.externalLink}` : ""}`).join("\n");

    const textMail = `
Dear ${order.orderByUser.name ?? "Customer"},
    
Thank you for trusting and purchasing from 3D2DS.
    
Below is the list of products you have purchased:
${productListText}
    
Access your purchased downloads in your library:
${new URL("/library", useRuntimeConfig().public.siteUrl).href}
If you have any questions or need further assistance, feel free to contact us.
    
Best regards,
3D2DS
    `;

    // const attachments: Attachment[] = [];

    // for (const item of order.items) {
    //   const file = item.product.files[0];
    //   if (!file) continue;

    //   const stream: Readable = await S3.CLIENT.getObject(file.bucket, file.objectName);

    //   stream.on("error", (err) => {
    //     console.error("[MINIO STREAM ERROR]", err);
    //   });

    //   attachments.push({
    //     filename: file.objectName,
    //     content: stream,
    //     contentType: "application/octet-stream",
    //   });
    // }

    await Mail.client
      .sendMail({
        from: `"3D2DS" <${Mail.userAuth}>`,
        to: order.orderByUser.email,
        subject: "Thank you for your purchase at 3D2DS",
        text: textMail,
        // attachments: attachments,
      });

    await prisma.order.update({
      where: {
        publicId: orderPublicId,
      },
      data: {
        status: "DELIVERED",
      },
    });
  }

  async cancel() {
    const result = await prisma.order.updateMany({
      where: { id: this.order.id, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    if (!result.count) throw new ServerError("Only pending orders can be cancelled", 409, "logic");
  }
}
