export default defineWrappedRequiredAdminHandler(async (event) => {
  return await prisma.category
    .findMany({
      select: {
        publicId: true,
        name: true,
        type: true,
        active: true,
        products: {
          select: {
            publicId: true,
            name: true,
            tags: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    })
    .then((items) =>
      items.map((item) => ({
        ...item,
        products: item.products.map((product) => {
          return {
            ...product,
            tags: product.tags.filter((tag) => item.tags.some((t) => t.id === tag.id)).map(tag => tag.name).join(', '),
          };
        }),
        tags: item.tags.map((tag) => tag.name),
      })),
    );
});
