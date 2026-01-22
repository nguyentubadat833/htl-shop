import { S3 } from "./s3";
import slug from 'slug'
import { ProductInfo } from "#shared/types/product";
import { ObjectStorage, Prisma, Product, ProductStatus, ProductPlan } from "~~/prisma/generated/client";
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

  async withId(id: number) {
    this.product = await prisma.product.findUniqueOrThrow({
      where: { id: id },
    });
    return this;
  }

  async withPublicId(productPublicId: string) {
    this.product = await prisma.product.findUniqueOrThrow({
      where: { publicId: productPublicId },
    });
    return this;
  }

  static async create(plan: ProductPlan, name: string, price: number, info: ProductInfo, createdByUserId: number, categoryPublicIds: string[]) {
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

    let categoryIds: number[] = []
    if (categoryPublicIds.length) {
      categoryIds = await prisma.category.findMany({
        where: {
          publicId: {
            in: categoryPublicIds
          }
        },
        select: {
          id: true
        }
      }).then(data => data.map(i => i.id))
    }

    return await prisma.product.create({
      data: {
        plan,
        name,
        alias,
        price,
        info: info as Prisma.JsonObject,
        createdByUserId: createdByUserId,
        categories: {
          connect: categoryIds.map(id => {
            return {
              id: id
            }
          })
        }
      },
    });
  }

  async update(name?: string, price?: number, info?: ProductInfo, status?: ProductStatus, categoryPublicIds?: string[], plan?: ProductPlan) {
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

    if (status === 'ACTIVE') {
      const files = await prisma.objectStorage.findMany({
        where: {
          AND: {
            productId: this.product.id,
            // uploadedAt: {
            //   not: null
            // }
          }
        },
        select: {
          type: true
        }
      })

      if (!files.find(file => file.type === 'DESIGN')) {
        throw new ServerError('Required product file', 409, 'logic')
      }

      if (!files.find(file => file.type === 'IMAGE')) {
        throw new ServerError('Required thumbnail', 409, 'logic')
      }
    }

    let categoryIds: number[] = []
    if (categoryPublicIds && categoryPublicIds.length) {
      categoryIds = await prisma.category.findMany({
        where: {
          publicId: {
            in: categoryPublicIds
          }
        },
        select: {
          id: true
        }
      }).then(data => data.map(i => i.id))
    }

    return prisma.product.update({
      where: {
        id: this.product.id,
      },
      data: {
        plan: plan,
        alias: await setAlias(name),
        name: name,
        price: price,
        info: info,
        status: status,
        categories: {
          set: categoryIds.map(id => {
            return {
              id: id
            }
          })
        }
      },
    });
  }

  async softDelete() {
    await this.update(undefined, undefined, undefined, ProductStatus.SOFT_DELETE);

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
