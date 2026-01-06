import { ProductItemResponse } from "~~/shared/types/product";

export default defineWrappedRequiredAdminHandler(async (event) => {
  return (await prisma.product.findMany({
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
          publicId: true
        }
      }
    },
  })) as ProductItemResponse[];
});
