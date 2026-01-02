import { GetOptionSchema } from "#shared/schemas/option";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { key } = zodValidateRequestOrThrow(GetOptionSchema, getRouterParams(event));
  return await prisma.defineOption.findMany({
    where: { key },
    select: { value: true },
  }).then(data => data.map(i => i.value))
});
