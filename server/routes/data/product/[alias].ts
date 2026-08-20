import z from "zod";
import { ProductInfo, ProductSEOItemResponse } from "#shared/types/product";
import { ProductStatus } from "~~/prisma/generated/enums";
import { orderPaidValues } from "~~/shared/constants/order.constants";
import { changeRate, getAmountVND } from "~~/server/core/service/money";
// import { ProductPlan } from "~~/prisma/generated/enums"

export default defineWrappedResponseHandler(async (event) => {
  const { alias } = zodValidateRequestOrThrow(
    z.object({
      alias: z.string(),
    }),
    getRouterParams(event),
  );

  const { get } = changeRate();

  const [product, changeRateResult] = await Promise.all([
    prisma.product.findUnique({
      where: {
        alias: alias,
      },
      select: {
        id: true,
        alias: true,
        publicId: true,
        name: true,
        price: true,
        createdAt: true,
        plan: true,
        info: true,
        files: {
          where: {
            type: "IMAGE",
          },
          select: {
            publicId: true,
          },
        },
        status: true,
      },
    }),
    get(),
  ]);

  // if (!product || (product.status !== ProductStatus.ACTIVE)) {
  if (!product) {
    throw new ServerError("Not found", 404);
  } else {
    const userAuth = UserAuthContext.unwrapUserAuthContext(event);

    if (product.status !== ProductStatus.ACTIVE) {
      if (!userAuth) {
        throw new ServerError("Not found", 404);
      }

      const purchase = await prisma.cart.findFirst({
        where: {
          productId: product.id,
          order: {
            orderByUserId: userAuth.id,
            status: { in: orderPaidValues },
          },
        },
        select: { id: true },
      });

      if (!purchase) {
        throw new ServerError("Not found", 404);
      }
    }
  }

  return <ProductSEOItemResponse>{
    plan: product.plan,
    publicId: product.publicId,
    alias: product.alias,
    name: product.name,
    price: product.price,
    priceVND: await getAmountVND(product.price, changeRateResult),
    createdAt: product.createdAt.toString(),
    imageLinks: product.files.map((file) => file.publicId).map((id) => `/storage/image?publicId=${id}`),
    categories: [],
    info: product.info as ProductInfo
  };
});
