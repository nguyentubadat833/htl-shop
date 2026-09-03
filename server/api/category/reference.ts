import { CategoryReference } from "~~/shared/types/category"

export default defineWrappedRequiredAdminHandler(async (event): Promise<CategoryReference[]> => {
  return await prisma.category.findMany({
    select: {
      publicId: true,
      name: true,
      type: true,
      active: true,
      tags: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          products: {
            where: {
              status: {
                not: 'SOFT_DELETE'
              }
            }
          }
        }
      }
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ]
  }).then(items => items.map(item => ({
    publicId: item.publicId,
    name: item.name,
    type: item.type,
    active: item.active,
    tags: item.tags,
    totalProducts: item._count.products
  } satisfies CategoryReference)))
})
