import prisma from "~~/lib/prisma";
import { ObjectStorage, Product, ProductStatus } from "@prisma/client";
import { ProductItemResponse } from "~~/shared/types/product";

export class ProductService {
  product!: Product;
  constructor(product?: Product) {
    if (product) {
      this.product = product;
    }
  }

  async withPublicId(productPublicId: string) {
    this.product = await prisma.product.findUniqueOrThrow({
      where: { publicId: productPublicId },
    });
    return this;
  }

  static list(): Promise<ProductItemResponse[]> {
    return prisma.product.findMany({
      select: {
        publicId: true,
        name: true,
        price: true,
      },
    });
  }

  static async create(name: string, price: number, createdByUserId: number) {
    return await prisma.product.create({
      data: {
        name,
        price,
        createdByUserId: createdByUserId,
      },
    });
  }

  update(name?: string, price?: number, status?: ProductStatus) {
    return prisma.product.update({
      where: {
        id: this.product.id,
      },
      data: {
        name: name,
        price: price,
        status: status,
      },
    });
  }

  async softDelete() {
    await this.update(undefined, undefined, ProductStatus.INACTIVE);

    const objectStorages = await prisma.objectStorage.findMany({
      where: {
        productId: this.product.id,
      },
    });

    await this.deleteObjectStorages(objectStorages);
  }

  async addImages(imageNames: string[]) {
    const objectNames = imageNames.map((name) => `${Date.now()}_${name}`);
    await prisma.objectStorage.createMany({
      data: objectNames.map((name) => {
        return {
          productId: this.product.id,
          bucket: S3.BUCKET_UPLOAD_DEFAULT,
          objectName: name,
        };
      }),
    });
    return await Promise.all(objectNames.map((name) => S3.CLIENT.presignedPutObject(S3.BUCKET_UPLOAD_DEFAULT, name)));
  }

  private async deleteObjectStorages(objectStorages: ObjectStorage[]) {
    await prisma.objectStorage.deleteMany({
      where: {
        id: {
          in: objectStorages.map((os) => os.id),
        },
      },
    });

    S3.CLIENT.removeObjects(
      S3.BUCKET_UPLOAD_DEFAULT,
      objectStorages.map((os) => os.objectName),
    );
  }

  async removeImages(imagePublicIds: string[]) {
    const objectStorages = await prisma.objectStorage.findMany({
      where: {
        bucket: S3.BUCKET_UPLOAD_DEFAULT,
        publicId: {
          in: imagePublicIds,
        },
      },
    });

    await this.deleteObjectStorages(objectStorages);
  }

  get finalPrice() {
    return this.product.price;
  }
}
