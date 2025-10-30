import prisma from "~~/lib/prisma";
import { ProductItemResponse } from "~~/shared/types/product";

export default defineWrappedResponseHandler(async (event) => {
  return (await prisma.product.findMany({
    where: {
      status: {
        in: ["ACTIVE", "INACTIVE"],
      },
    },
    select: {
      publicId: true,
      name: true,
      price: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      images: {
        select: {
          publicId: true,
          thumbnail: true,
        },
      },
    },
  })) as ProductItemResponse[];
});
