import { ProductInfo, ProductItemResponse } from "#shared/types/product";

export default defineWrappedRequiredAdminHandler(async (event) => {
  return await prisma.product.findMany({
    where: {
      status: {
        in: ["ACTIVE", "INACTIVE"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      publicId: true,
      plan: true,
      name: true,
      price: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      info: true,
      files: {
        select: {
          publicId: true,
          type: true,
        },
      },
      categories: {
        select: {
          publicId: true,
        },
      },
      tags: {
        select: {
          id: true,
        },
      },
    },
  }).then(items => items.map(item => {
    return {
      publicId: item.publicId,
      plan: item.plan,
      name: item.name,
      price: item.price,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      info: item.info as ProductInfo,
      files: item.files.map(file => ({
        publicId: file.publicId,
        type: file.type
      })),
      categoryIds: item.categories.map(ctg => ctg.publicId),
      tagIds: item.tags.map(tag => tag.id)
    } satisfies ProductItemResponse
  }))
});
