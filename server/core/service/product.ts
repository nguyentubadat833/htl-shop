import prisma from "~~/lib/prisma";
import { ObjectStorage, Product, ProductStatus } from "@prisma/client";
import { ProductItemResponse } from "~~/shared/types/product";
import { S3 } from "./s3";

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

  static async getThumbnail(thumbnail_publicId: string) {
    const { bucket, objectName, thumbnail } = await prisma.objectStorage.findFirstOrThrow({
      where: {
        publicId: thumbnail_publicId,
      },
      select: {
        bucket: true,
        objectName: true,
        thumbnail: true,
      },
    });

    if (!thumbnail) {
      throw new Error("Not a thumbnail image");
    }

    const statObject = await S3.CLIENT.statObject(bucket, objectName);
    if (!statObject) {
      throw new Error("Image not found in storage");
    }

    const contentType = statObject.metaData["content-type"] || statObject.metaData["Content-Type"] || "application/octet-stream";

    return { bucket, objectName, contentType };
  }

  static async list(): Promise<ProductItemResponse[]> {
    const products = await prisma.product.findMany({
      select: {
        publicId: true,
        name: true,
        price: true,
        images: {
          where: {
            thumbnail: true,
          },
          select: {
            publicId: true,
          },
        },
      },
    });
    return products.map((product) => {
      return {
        publicId: product.publicId,
        name: product.name,
        price: product.price,
        thumbnail_publicIds: product.images.map((image) => image.publicId),
      };
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

  async addImage(imageName: string, thumbnail: boolean = false): Promise<string> {
    const objectName = `${Date.now()}_${imageName}`;
    await prisma.objectStorage.create({
      data: {
        productId: this.product.id,
        bucket: S3.BUCKET_UPLOAD_DEFAULT,
        objectName: objectName,
        thumbnail: thumbnail,
      },
    });
    return await S3.CLIENT.presignedPutObject(S3.BUCKET_UPLOAD_DEFAULT, objectName);
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
