import { ProductService } from "~~/server/core/service/product";
import { UpdateProductSchema } from "~~/shared/schemas/product";
import { UserAuthContext } from "~~/server/utils/context-working";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { publicId, name, price, status, info } = zodValidateRequestOrThrow(UpdateProductSchema, await readBody(event));
  return await (await new ProductService().withPublicId(publicId)).update(name, price, info, status);
});
