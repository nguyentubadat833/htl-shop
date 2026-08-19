import z from "zod";
import slug from "slug";
import { CategoryType } from "#shared/types/category";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { name, type, active, tags } = zodValidateRequestOrThrow(
    z.object({
      name: z.string(),
      type: z.enum(CategoryType),
      active: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
    }),
    await readBody(event),
  );

  const alias = slug(name);

  const findWithAlias = await prisma.product.findUnique({
    where: {
      alias: alias,
    },
    select: {
      id: true,
    },
  });

  if (findWithAlias) {
    throw new ServerError("Category name must be unique", 409, "logic");
  }

  const category = await prisma.category.create({
    data: {
      alias: alias,
      name: name,
      type: type,
      active: active,
      tags: {
        create: tags.map((tag) => ({ name: tag })),
      },
    },
    select: {
      publicId: true,
      alias: true,
      name: true,
      type: true,
      tags: true,
    },
  });

  return category;
});
