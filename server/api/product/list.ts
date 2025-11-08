import prisma from "~~/lib/prisma";
import { ProductItemResponse } from "~~/shared/types/product";

export default defineWrappedResponseHandler(async (event) => {
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
    },
  })) as ProductItemResponse[];
});
