import { ProductHelper } from "~~/server/core/service/product";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const softDeleteProductIds = await prisma.product
    .findMany({
      where: {
        status: "SOFT_DELETE",
      },
      select: {
        id: true,
      },
    })
    .then((rs) => rs.map((item) => item.id));

  const objectStorages = await prisma.objectStorage.findMany({
    where: {
      productId: {
        in: softDeleteProductIds,
      },
    },
  });

  await ProductHelper.deleteObjectStorages(objectStorages);

  setResponseStatus(event, 204);
});
