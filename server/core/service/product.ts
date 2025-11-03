import prisma from "~~/lib/prisma";
import { FileType, ObjectStorage, Product, ProductStatus } from "@prisma/client";
import { S3 } from "./s3";
import slug from 'slug'
export class ProductService {
  product!: Product;

  constructor(product?: Product) {
    if (product) {
      this.product = product;
    }
  }

  get finalPrice() {
    return this.product.price;
  }

  async withPublicId(productPublicId: string) {
    this.product = await prisma.product.findUniqueOrThrow({
      where: { publicId: productPublicId },
    });
    return this;
  }

  static async create(name: string, price: number, createdByUserId: number) {
    const alias = slug(name)
    const findWithAlias = await prisma.product.findUnique({
      where: {
        alias: alias
      },
      select: {
        id: true
      }
    })

    if (findWithAlias) {
      throw new ServerError('Product name must be unique', 409, 'logic')
    }

    return await prisma.product.create({
      data: {
        name,
        alias,
        price,
        createdByUserId: createdByUserId,
      },
    });
  }

  async update(name?: string, price?: number, status?: ProductStatus) {
    const setAlias = async (input?: string) => {
      if (!input) return undefined

      const alias = slug(input)
      const findWithAlias = await prisma.product.findFirst({
        where: {
          AND: {
            alias: slug(input),
            id: {
              not: this.product.id
            }
          }
        }
      })

      if (findWithAlias) {
        throw new ServerError('Product name must be unique', 409, 'logic')
      }

      return alias
    }
    return prisma.product.update({
      where: {
        id: this.product.id,
      },
      data: {
        alias: await setAlias(name),
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

    await Helper.deleteObjectStorages(objectStorages);
  }

  async addFile(name: string, size: number, type: FileType): Promise<string> {
    const objectName = `${Date.now()}_${name}`;
    await prisma.objectStorage.create({
      data: {
        productId: this.product.id,
        bucket: S3.BUCKET_UPLOAD_DEFAULT,
        objectName: objectName,
        type: type,
        size: BigInt(size),
      },
    });
    return await S3.CLIENT.presignedPutObject(S3.BUCKET_UPLOAD_DEFAULT, objectName);
  }

  static async getFile(publicId: string, type: FileType) {
    const { bucket, objectName } = await prisma.objectStorage.findFirstOrThrow({
      where: {
        publicId: publicId,
        type: type,
      },
      select: {
        bucket: true,
        objectName: true,
      },
    });

    const statObject = await S3.CLIENT.statObject(bucket, objectName);
    if (!statObject) {
      throw new ServerError("File not found in storage", 404, "storage");
    }

    const contentType = statObject.metaData["content-type"] || statObject.metaData["Content-Type"] || "application/octet-stream";

    return { bucket, objectName, contentType };
  }

  static async deleteFiles(publicIds: string[]) {
    const objectStorages = await prisma.objectStorage.findMany({
      where: {
        bucket: S3.BUCKET_UPLOAD_DEFAULT,
        publicId: {
          in: publicIds,
        },
      },
    });

    await Helper.deleteObjectStorages(objectStorages);
  }
}

class Helper {
  constructor() { }

  static async deleteObjectStorages(objectStorages: ObjectStorage[]) {
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
}
