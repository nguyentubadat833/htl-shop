import { GetOptionSchema } from "#shared/schemas/option";
import prisma from "~~/lib/prisma";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { key } = zodValidateRequestOrThrow(GetOptionSchema, getRouterParams(event));
  return await prisma.defineOption.findMany({
    where: { key },
    select: { value: true },
  });
});
