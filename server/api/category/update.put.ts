// import slug from "slug";
// import z from "zod";
// import { CategoryType } from "#shared/types/category";

// export default defineWrappedRequiredAdminHandler(async (event) => {
//   const { publicId, data } = zodValidateRequestOrThrow(
//     z.object({
//       publicId: z.string(),
//       data: z.object({
//         name: z.string().optional(),
//         type: z.enum(CategoryType).optional(),
//         active: z.boolean().optional(),
//         tags: z.array(z.string()).optional(),
//       }),
//     }),
//     await readBody(event),
//   );

//   let alias: undefined | string = undefined;
//   if (data.name) {
//     alias = slug(data.name);

//     const findWithAlias = await prisma.product.findUnique({
//       where: {
//         alias: alias,
//       },
//       select: {
//         id: true,
//       },
//     });

//     if (findWithAlias) {
//       throw new ServerError("Category name must be unique", 409, "logic");
//     }
//   }

//   const category = await prisma.category.update({
//     where: {
//       publicId: publicId,
//     },
//     data: {
//       alias: alias,
//       name: data.name,
//       type: data.type,
//       active: data.active,
//     },
//     select: {
//       publicId: true,
//       alias: true,
//       name: true,
//       type: true,
//     },
//   });
//   return category;
// });

import slug from "slug";
import z from "zod";
import { CategoryType } from "#shared/types/category";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { publicId, data } = zodValidateRequestOrThrow(
    z.object({
      publicId: z.string(),
      data: z.object({
        name: z.string().optional(),
        type: z.enum(CategoryType).optional(),
        active: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
      }),
    }),
    await readBody(event),
  );

  let alias: string | undefined;

  if (data.name) {
    alias = slug(data.name);

    const findWithAlias = await prisma.category.findUnique({
      where: {
        alias,
      },
      select: {
        publicId: true,
      },
    });

    if (findWithAlias && findWithAlias.publicId !== publicId) {
      throw new ServerError(
        "Category name must be unique",
        409,
        "logic",
      );
    }
  }

  const category = await prisma.$transaction(async (tx) => {
    // Chỉ sync tags khi request có truyền tags
    if (data.tags !== undefined) {
      const currentCategory = await tx.category.findUniqueOrThrow({
        where: {
          publicId,
        },
        select: {
          id: true,
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const requestTags = [...new Set(data.tags)];

      const currentTagNames = new Set(
        currentCategory.tags.map((tag) => tag.name),
      );

      const requestTagNames = new Set(requestTags);

      // Những tag cần xóa
      const tagsToDelete = currentCategory.tags.filter(
        (tag) => !requestTagNames.has(tag.name),
      );

      // Những tag cần tạo
      const tagsToCreate = requestTags.filter(
        (name) => !currentTagNames.has(name),
      );

      if (tagsToDelete.length > 0) {
        await tx.tag.deleteMany({
          where: {
            id: {
              in: tagsToDelete.map((tag) => tag.id),
            },
          },
        });
      }

      if (tagsToCreate.length > 0) {
        await tx.tag.createMany({
          data: tagsToCreate.map((name) => ({
            name,
            categoryId: currentCategory.id,
          })),
        });
      }
    }

    return tx.category.update({
      where: {
        publicId,
      },
      data: {
        alias,
        name: data.name,
        type: data.type,
        active: data.active,
      },
      select: {
        publicId: true,
        alias: true,
        name: true,
        type: true,
        tags: true,
      },
    });
  });

  console.log(category)

  return category;
});