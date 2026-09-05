import { S3 } from "./s3";
import slug from "slug";
import { ProductInfo } from "#shared/types/product";
import { ObjectStorage, Prisma, Product, ProductStatus, ProductPlan } from "~~/prisma/generated/client";
import { UserAuth } from "~~/server/utils/context-working";
import { orderPaidValues } from "~~/shared/constants/order.constants";
import z from "zod";

const setNewAliasSchema = z.object({
  type: z.literal("new"),
  name: z.string(),
});

const setUpdateAliasSchema = z.object({
  type: z.literal("update"),
  productId: z.number(),
  name: z.string(),
});

const setAliasSchema = z.discriminatedUnion("type", [setNewAliasSchema, setUpdateAliasSchema]);

type SetAliasInput = z.infer<typeof setAliasSchema>;

export class ProductService {
  product!: Product;

  constructor(product?: Product) {
    if (product) {
      this.product = product;
    }
  }

  static async setProductAlias(input: SetAliasInput) {
    let alias = slug(input.name);

    // Điều kiện query alias đã tồn tại ở bất kỳ product nào khác hay chưa (không lọc theo status)
    const whereCondition: Prisma.ProductWhereInput =
      input.type === "new"
        ? { alias }
        : {
            alias,
            id: { not: input.productId },
          };

    const existsAlias = await prisma.product.findFirst({
      where: whereCondition,
      select: { id: true },
    });

    if (existsAlias) {
      // Tạo suffix ngẫu nhiên kết hợp timestamp + random string để tránh trùng khi chạy đồng thời
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const timeSuffix = Date.now().toString().slice(-4);
      alias = `${alias}-${timeSuffix}${randomSuffix}`;
    }

    return alias;
  }

  static async hasUserPurchasedProduct(userId: number, productId: number): Promise<boolean> {
    const purchase = await prisma.cart.findFirst({
      where: {
        productId,
        order: {
          orderByUserId: userId,
          status: { in: orderPaidValues },
        },
      },
      select: { id: true },
    });

    return !!purchase;
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

  static async create(
    plan: ProductPlan,
    name: string,
    price: number,
    info: ProductInfo,
    createdByUserId: number,
    categoryPublicIds: string[],
    tagIds: string[],
    externalLink?: string,
  ) {
    // let alias = slug(name);
    // const findWithAlias = await prisma.product.findUnique({
    //   where: {
    //     alias: alias,
    //   },
    //   select: {
    //     id: true,
    //   },
    // });

    // if (findWithAlias) {
    //   // throw new ServerError('Product name must be unique', 409, 'logic')
    //   const last6 = Date.now().toString().slice(-5);
    //   alias = `${alias}-${last6}`;
    // }

    let categoryIds: number[] = [];
    if (categoryPublicIds.length) {
      categoryIds = await prisma.category
        .findMany({
          where: {
            publicId: {
              in: categoryPublicIds,
            },
          },
          select: {
            id: true,
          },
        })
        .then((data) => data.map((i) => i.id));
    }

    return await prisma.product.create({
      data: {
        plan,
        name,
        alias: await ProductService.setProductAlias({ type: "new", name }),
        price,
        externalLink,
        currency: "USD",
        info: info as Prisma.JsonObject,
        createdByUserId: createdByUserId,
        categories: {
          connect: categoryIds.map((id) => {
            return {
              id: id,
            };
          }),
        },
        tags: {
          connect: tagIds.map((tag) => ({ id: tag })),
        },
      },
    });
  }

  async update(
    name?: string,
    price?: number,
    info?: ProductInfo,
    status?: ProductStatus,
    categoryPublicIds?: string[],
    plan?: ProductPlan,
    tagIds?: string[],
    externalLink?: string,
  ) {
    // const setAlias = async (input?: string) => {
    //   if (!input) return undefined;

    //   const alias = slug(input);
    //   const findWithAlias = await prisma.product.findFirst({
    //     where: {
    //       AND: {
    //         alias: slug(input),
    //         id: {
    //           not: this.product.id,
    //         },
    //       },
    //     },
    //     select: {
    //       status: true,
    //     },
    //   });

    //   if (findWithAlias) {
    //     if (findWithAlias.status === ProductStatus.SOFT_DELETE) {
    //       return undefined;
    //     }
    //     throw new ServerError("Product name must be unique", 409, "logic");
    //   }
    //   return alias;
    // };

    if (status === "ACTIVE") {
      const files = await prisma.objectStorage.findMany({
        where: {
          AND: {
            productId: this.product.id,
            // uploadedAt: {
            //   not: null
            // }
          },
        },
        select: {
          type: true,
        },
      });

      if (this.product.plan === ProductPlan.PRO) {
        if (!files.find((file) => file.type === "DESIGN")) {
          throw new ServerError("Required product file", 409, "logic");
        }
      } else {
        if (!this.product.externalLink && !externalLink) {
          throw new ServerError("Required external link", 409, "logic");
        }
      }

      if (!files.find((file) => file.type === "IMAGE")) {
        throw new ServerError("Required thumbnail", 409, "logic");
      }
    }

    let categoryIds: number[] | undefined = undefined;
    if (categoryPublicIds && categoryPublicIds.length) {
      categoryIds = await prisma.category
        .findMany({
          where: {
            publicId: {
              in: categoryPublicIds,
            },
          },
          select: {
            id: true,
          },
        })
        .then((data) => data.map((i) => i.id));
    }
    return prisma.product.update({
      where: {
        id: this.product.id,
      },
      data: {
        plan: plan,
        alias: name ? await ProductService.setProductAlias({ type: "update", productId: this.product.id, name }) : undefined,
        name: name,
        price: price,
        info: info,
        status: status,
        externalLink: externalLink,
        categories: categoryIds
          ? {
              set: categoryIds.map((id) => {
                return {
                  id: id,
                };
              }),
            }
          : undefined,
        tags: tagIds
          ? {
              set: tagIds.map((id) => ({ id })),
            }
          : undefined,
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

    await ProductHelper.deleteObjectStorages(objectStorages);
  }

  async addFile(name: string, size: number, type: FileType): Promise<string> {
    const objectName = `${Date.now()}_${crypto.randomUUID()}_${name}`;

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

  static async getFile(publicId: string, type: FileType, user?: UserAuth) {
    const { bucket, objectName, productId } = await prisma.objectStorage.findFirstOrThrow({
      where: {
        publicId: publicId,
        type: type,
      },
      select: {
        bucket: true,
        objectName: true,
        productId: true,
      },
    });

    if (type === "DESIGN") {
      if (!user) {
        throw new ServerError("Access defined", 403);
      }

      if (user.role !== "ADMIN") {
        await ProductService.hasUserPurchasedProduct(user.id, productId);
      }
    }

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

    await ProductHelper.deleteObjectStorages(objectStorages);
  }
}

export class ProductHelper {
  constructor() {}

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
