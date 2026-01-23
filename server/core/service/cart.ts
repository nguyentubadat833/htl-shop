import { OrderService } from "./order";
import { ProductService } from "./product";
import { CartItemResponse } from "#shared/types/cart";
import { ProductPlan } from "~~/prisma/generated/client";

export class CartService {
  constructor(private readonly userId: number) { }

  async count() {
    return await prisma.cart.count({
      where: {
        userId: this.userId,
        orderId: null
      }
    })
  }

  async list(): Promise<CartItemResponse[]> {
    return await prisma.cart.findMany({
      where: {
        userId: this.userId,
        orderId: null
      },
      select: {
        id: true,
        product: {
          include: {
            files: {
              where: {
                type: 'IMAGE'
              },
              select: {
                publicId: true
              },
              take: 1
            }
          }
        }
      },
      orderBy: { id: 'desc' },
    }).then(data => data.map(item => {
      return {
        cartId: item.id,
        product: {
          plan: item.product.plan,
          publicId: item.product.publicId,
          alias: item.product.alias,
          name: item.product.name,
          price: item.product.price,
          createdAt: item.product.createdAt.toString(),
          imageLinks: item.product.files.map(file => file.publicId).map(id => `/storage/image?publicId=${id}`)
        }
      }
    }))
  }

  async addProduct(product_publicId: string) {
    const { product, finalPrice } = await new ProductService().withPublicId(product_publicId)
    const exists = await prisma.cart.findFirst({
      where: {
        userId: this.userId,
        productId: product.id,
        orderId: null
      },
      select: {
        id: true
      }
    });
    if (exists) {
      return
    } else {
      await prisma.cart.create({
        data: {
          userId: this.userId,
          productId: product.id,
          price: finalPrice
        }
      })
    }
  }

  async removeProducts(product_publicIds: string[]) {
    await prisma.cart.deleteMany({
      where: {
        userId: this.userId,
        product: {
          publicId: {
            in: product_publicIds
          }
        }
      },
    });
  }

  async checkout(cardIds: string[]) {
    return await OrderService.create(this.userId, cardIds);
  }
}
