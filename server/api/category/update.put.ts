import slug from "slug"
import z from "zod"
import { CategoryType } from "~~/shared/types/category"

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { publicId, data } = zodValidateRequestOrThrow(z.object({
    publicId: z.string(),
    data: z.object({
      name: z.string().optional(),
      type: z.enum(CategoryType).optional(),
      active: z.boolean().optional()
    })
  }), await readBody(event))

  const alias = slug(name)

  const findWithAlias = await prisma.product.findUnique({
    where: {
      alias: alias
    },
    select: {
      id: true
    }
  })

  if (findWithAlias) {
    throw new ServerError('Category name must be unique', 409, 'logic')
  }

  const category = await prisma.category.update({
    where: {
      publicId: publicId
    },
    data: {
      alias: alias,
      name: data.name,
      type: data.type,
      active: data.active
    },
    select: {
      publicId: true,
      alias: true,
      name: true,
      type: true
    }
  })
  return category
})
