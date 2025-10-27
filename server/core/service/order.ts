import prisma from "~~/lib/prisma";
import { ProductService } from "./product";
import { Order } from "@prisma/client";

export class OrderService {
  order!: Order;
  constructor(order?: Order) {
    if (order) {
      this.order = order;
    }
  }

  async withPublicId(productPublicId: string) {
    this.order = await prisma.order.findUniqueOrThrow({
      where: { publicId: productPublicId },
    });
    return this;
  }

  static async create(orderByUserId: number, product_publicIds: string[]) {
    const prds = await Promise.all(
      product_publicIds.map(async (id) => {
        const prdService = await new ProductService().withPublicId(id);
        return { id: prdService.product.id, price: prdService.finalPrice };
      }),
    );

    return await prisma.order.create({
      data: {
        orderByUserId: orderByUserId,
        amount: prds.reduce((sum, prd) => sum + prd.price, 0),
        items: {
          createMany: {
            data: prds.map((prd) => ({ productId: prd.id, price: prd.price })),
          },
        },
      },
    });
  }

  async removeItems(productPublicIds: string[]) {
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: {
          orderId: this.order.id,
          product: {
            publicId: {
              in: productPublicIds,
            },
          },
        },
      });

      const { _sum } = await tx.orderItem.aggregate({
        where: { orderId: this.order.id },
        _sum: { price: true },
      });

      const newAmount = _sum.price ?? 0;

      const order = await tx.order.update({
        where: { id: this.order.id },
        data: {
          amount: newAmount,
        },
      });

      this.order = order;
    });
  }

  async addItems(productPublicIds: string[]) {
    const items = await Promise.all(
      productPublicIds.map(async (id) => {
        const prdService = await new ProductService().withPublicId(id);
        return { productId: prdService.product.id, price: prdService.finalPrice };
      }),
    );

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.createMany({
        data: items.map((itm) => {
          return {
            productId: itm.productId,
            price: itm.price,
            orderId: this.order.id,
          };
        }),
      });

      const { _sum } = await tx.orderItem.aggregate({
        where: { orderId: this.order.id },
        _sum: { price: true },
      });

      const newAmount = _sum.price ?? 0;

      const order = await tx.order.update({
        where: { id: this.order.id },
        data: {
          amount: newAmount,
        },
      });

      this.order = order;
    });
  }

  async cancel() {
    await prisma.order.update({
      where: { id: this.order.id },
      data: {
        status: "CANCELLED",
      },
    });
  }
}
