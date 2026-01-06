export default defineWrappedRequiredAdminHandler(async (event) => {
  return await prisma.category.findMany({
    select: {
      publicId: true,
      name: true,
      type: true,
      active: true,
      products: {
        select: {
          publicId: true,
          name: true
        }
      }
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ]
  })
})
