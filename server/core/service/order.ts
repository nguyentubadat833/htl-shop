import { OrderWithProductsResponse } from "#shared/types/order";
import { Order } from '~~/prisma/generated/client'

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
        items: {
          select: {
            product: {
              select: {
                alias: true,
                name: true,
                price: true
              }
            }
          }
        },
        _count: {
          select: {
            payments: {
              where: {
                status: 'SUCCESS'
              }
            }
          }
        }
      }
    })

    if (!data) {
      throw new ServerError(HttpStatus[404], 404)
    }

    const { publicId, status, amount, items, _count } = data
    return {
      publicId,
      status,
      amount,
      products: items.map(item => {
        return {
          name: item.product.name,
          price: item.product.price
        }
      }),
      paid: _count.payments > 0
    }
  }

  static async create(orderByUserId: number, cardIds: string[]) {
    // const products = await Promise.all(
    //   product_publicIds.map(async (id) => {
    //     const prdService = await new ProductService().withPublicId(id);
    //     return { id: prdService.product.id, price: prdService.finalPrice };
    //   }),
    // );
    const items = await prisma.cart.findMany({
      where: {
        id: {
          in: cardIds
        },
        userId: orderByUserId
      }
    })

    return await prisma.order.create({
      data: {
        orderByUserId: orderByUserId,
        amount: items.reduce((sum, prd) => sum + prd.price, 0),
        items: {
          connect: items.map(c => ({ id: c.id }))
        }
      },
      include: {
        items: true
      }
    });
  }

  // async removeItems(productPublicIds: string[]) {
  //   await prisma.$transaction(async (tx) => {
  //     await tx.orderItem.deleteMany({
  //       where: {
  //         orderId: this.order.id,
  //         product: {
  //           publicId: {
  //             in: productPublicIds,
  //           },
  //         },
  //       },
  //     });

  //     const { _sum } = await tx.orderItem.aggregate({
  //       where: { orderId: this.order.id },
  //       _sum: { price: true },
  //     });

  //     const newAmount = _sum.price ?? 0;

  //     const order = await tx.order.update({
  //       where: { id: this.order.id },
  //       data: {
  //         amount: newAmount,
  //       },
  //     });

  //     this.order = order;
  //   });
  // }

  // async addItems(productPublicIds: string[]) {
  //   const items = await Promise.all(
  //     productPublicIds.map(async (id) => {
  //       const prdService = await new ProductService().withPublicId(id);
  //       return { productId: prdService.product.id, price: prdService.finalPrice };
  //     }),
  //   );

  //   await prisma.$transaction(async (tx) => {
  //     await tx.orderItem.createMany({
  //       data: items.map((itm) => {
  //         return {
  //           productId: itm.productId,
  //           price: itm.price,
  //           orderId: this.order.id,
  //         };
  //       }),
  //     });

  //     const { _sum } = await tx.orderItem.aggregate({
  //       where: { orderId: this.order.id },
  //       _sum: { price: true },
  //     });

  //     const newAmount = _sum.price ?? 0;

  //     const order = await tx.order.update({
  //       where: { id: this.order.id },
  //       data: {
  //         amount: newAmount,
  //       },
  //     });

  //     this.order = order;
  //   });
  // }

  async cancel() {
    await prisma.order.update({
      where: { id: this.order.id },
      data: {
        status: "CANCELLED",
      },
    });
  }
}
