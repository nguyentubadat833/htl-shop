import prisma from "~~/lib/prisma";
import { ObjectStorage, Product, ProductStatus } from "@prisma/client";
import { S3 } from "./s3";
import { UserRole } from "@prisma/client";

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

  static async getImage(publicId: string, validateThumbnail: boolean) {
    const { bucket, objectName, thumbnail } = await prisma.objectStorage.findFirstOrThrow({
      where: {
        publicId: publicId,
      },
      select: {
        bucket: true,
        objectName: true,
        thumbnail: true,
      },
    });

    if (validateThumbnail && !thumbnail) {
      throw new ServerError(HttpStatus[404], 404, "validate");
    }

    // if (!thumbnail && (!userRole || userRole !== "ADMIN")) {
    //   throw new ServerError(HttpStatus[404], 404, "permission");
    // }

    const statObject = await S3.CLIENT.statObject(bucket, objectName);
    if (!statObject) {
      throw new ServerError("Image not found in storage", 404, "storage");
    }

    const contentType = statObject.metaData["content-type"] || statObject.metaData["Content-Type"] || "application/octet-stream";

    return { bucket, objectName, contentType };
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
    await this.update(undefined, undefined, ProductStatus.SOFT_DELETE);

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
