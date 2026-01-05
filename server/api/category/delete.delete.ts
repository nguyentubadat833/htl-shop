import z from "zod"

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { publicId } = zodValidateRequestOrThrow(z.object({
    publicId: z.string()
  }), getQuery(event));

  const category = await prisma.category.findUnique({
    where: {
      publicId
    },
    select: {
      id: true,
      products: {
        select: {
          id: true
        }
      }
    },
  })

  if (!category) {
    throw new ServerError('Category not found', 404, 'storage')
  }

  await Promise.all(
    category.products.map(async prd => {
      return await prisma.product.update({
        where: {
          id: prd.id
        },
        data: {
          categories: {
            disconnect: {
              id: category.id
            }
          }
        }
      })
    })
  )

  await prisma.category.delete({
    where: {
      id: category.id
    }
  })

  return
})
