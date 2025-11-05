import { Cart } from "@prisma/client";
import prisma from "~~/lib/prisma";
import { OrderService } from "./order";
import { ProductService } from "./product";

export class CartService {
  constructor(private readonly userId: number) { }

  async count() {
    return await prisma.cart.count({
      where: {
        userId: this.userId
      }
    })
  }

  async list() {
    return await prisma.cart.findMany({
      where: {
        userId: this.userId
      },
      select: {
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
      return <ProductSEOItemResponse>{
        plan: ProductPlan.Pro,
        publicId: item.product.publicId,
        alias: item.product.alias,
        name: item.product.name,
        price: item.product.price,
        createdAt: item.product.createdAt,
        imageLinks: item.product.files.map(file => file.publicId).map(id => `/storage/image?publicId=${id}`)
      }
    }))
  }

  async addProduct(product_publicId: string) {
    const productService = await new ProductService().withPublicId(product_publicId)
    return await prisma.cart.upsert({
      where: {
        userId_productId: {
          userId: this.userId,
          productId: productService.product.id,
        }
      },
      create: {
        userId: this.userId,
        productId: productService.product.id,
        price: productService.finalPrice
      },
      update: {}
    });
  }

  async removeProducts(product_publicIds: string[]) {
    await prisma.cart.deleteMany({
      where: {
        userId: this.userId,
        id: {
          in: product_publicIds,
        },
      },
    });
  }

  async checkout(product_pubicIds: string[]) {
    const order = await OrderService.create(this.userId, product_pubicIds);
    await prisma.cart.deleteMany({
      where: {
        product: {
          publicId: {
            in: product_pubicIds
          }
        }
      }
    })
    return order
  }
}
