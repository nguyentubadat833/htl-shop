import { CategoryReference } from "~~/shared/types/category"

export default defineWrappedRequiredAdminHandler(async (event): Promise<CategoryReference[]> => {
  return await prisma.category.findMany({
    select: {
      publicId: true,
      name: true,
      type: true,
      active: true
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ]
  })
})
