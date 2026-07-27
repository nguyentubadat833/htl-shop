import { CategorySEOItem } from "#shared/types/category";

export default defineWrappedResponseHandler(async (event) => {
  return await prisma.category
    .findMany({
      where: {
        active: true,
      },
      select: {
        publicId: true,
        alias: true,
        name: true,
        type: true,
        _count: {
          select: {
            products: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
        // products: {
        //   select: {
        //     id: true
        //   }
        // }
      },
      orderBy: {
        name: "asc",
      },
    })
    .then((data) =>
      data.map((item) => {
        return <CategorySEOItem>{
          ...item,
          productCounts: item._count.products
          // products: {
          //   count: 0,
          // },
        };
      }),
    );
});
