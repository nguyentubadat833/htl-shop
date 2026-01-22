import { ProductService } from "~~/server/core/service/product";
import { UpdateProductSchema } from "#shared/schemas/product";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { publicId, name, price, status, info, category_publicIds,plan } = zodValidateRequestOrThrow(UpdateProductSchema, await readBody(event));
  return await (await new ProductService().withPublicId(publicId)).update(name, price, info, status, category_publicIds, plan);
});
