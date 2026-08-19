import { CategoryReference } from "~~/shared/types/category"

export default defineWrappedRequiredAdminHandler(async (event): Promise<CategoryReference[]> => {
  return await prisma.category.findMany({
    select: {
      publicId: true,
      name: true,
      type: true,
      active: true,
      tags: true
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
