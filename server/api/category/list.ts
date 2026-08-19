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
      },
      tags: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ]
  }).then(items => items.map(item => ({
    ...item,
    tags: item.tags.map(tag => tag.name)
  })))
})
