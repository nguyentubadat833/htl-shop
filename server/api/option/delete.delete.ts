import { DeleteOptionSchema } from "~~/shared/schemas/option";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { key } = zodValidateRequestOrThrow(DeleteOptionSchema, getQuery(event));
  await prisma.defineOption.findMany({
    where: { key },
  });
  return
});
