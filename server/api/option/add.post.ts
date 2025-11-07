import prisma from "~~/lib/prisma";
import { AddOptionSchema } from "~~/shared/schemas/option";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { key, value } = zodValidateRequestOrThrow(AddOptionSchema, await readBody(event));

  return await prisma.defineOption
    .create({
      data: {
        key: key,
        value: value,
      },
    })
    .then((data) => {
      const { key, value } = data;
      return { key, value };
    });
});
