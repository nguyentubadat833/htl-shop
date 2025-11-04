import { Cart } from "@prisma/client";
import prisma from "~~/lib/prisma";
import { OrderService } from "./order";
import { ProductService } from "./product";

export class CartService {
  constructor(private readonly userId: number) {}

  async addProduct(product_publicId: string) {
    const productService = await new ProductService().withPublicId(product_publicId)
    return await prisma.cart.create({
      data: {
        userId: this.userId,
        productId: productService.product.id,
        price: productService.finalPrice
      },
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
    return await OrderService.create(this.userId, product_pubicIds);
  }
}
