export default defineWrappedRequiredAuthHandler(async (event) => {
  const query = getQuery(event);
  const queryNames = query.names

  const productNameItems = Array.isArray(queryNames) ? queryNames.map(String) : queryNames ? [String(queryNames)] : [];

  if (!productNameItems.length) {
    return [];
  }

  const existingProducts = await prisma.product.findMany({
    where: {
      name: {
        in: productNameItems,
      },
      status: {
        not: 'SOFT_DELETE'
      }
    },
    select: {
      name: true,
    },
  });

  const existingNames = new Set(existingProducts.map((product) => product.name));

  return productNameItems.map((name) => ({
    name,
    isDuplicate: existingNames.has(name),
  }));
});
