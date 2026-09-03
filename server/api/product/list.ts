import { ProductInfo, ProductItemResponse } from "#shared/types/product";
import z from "zod";

const CategoriesSchema = z.array(z.string());

export default defineWrappedRequiredAdminHandler(async (event) => {
  const query = getQuery(event);
  const categories = query.categories;

  let categoryIds: undefined | string[];
  if (typeof categories === "string") {
    categoryIds = [categories];
  } else {
    const parseCategories = CategoriesSchema.safeParse(categories);
    if (parseCategories.success) {
      categoryIds = parseCategories.data;
    }
  }

  return (await prisma.product
    .findMany({
      where: {
        status: {
          in: ["ACTIVE", "INACTIVE"],
        },
        categories: categoryIds?.length
          ? {
              some: {
                publicId: {
                  in: categoryIds,
                },
              },
            }
          : undefined,
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
        externalLink: true,
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
    })
    .then((items) =>
      items.map((item) => {
        return {
          publicId: item.publicId,
          plan: item.plan,
          name: item.name,
          price: item.price,
          status: item.status,
          createdAt: item.createdAt.toString(),
          updatedAt: item.updatedAt.toString(),
          info: item.info as ProductInfo,
          files: item.files.map((file) => ({
            publicId: file.publicId,
            type: file.type,
          })),
          categoryIds: item.categories.map((ctg) => ctg.publicId),
          tagIds: item.tags.map((tag) => tag.id),
          externalLink: item.externalLink ?? undefined,
        } satisfies ProductItemResponse;
      }),
    )) as ProductItemResponse[];
});
