import { ProductService } from "~~/server/core/service/product";
import { UpdateProductSchema } from "~~/shared/schemas/product";

export default defineWrappedResponseHandler(async (event) => {
  const { publicId, name, price, status } = zodValidateRequestOrThrow(UpdateProductSchema, await readBody(event));
  return await (await new ProductService().withPublicId(publicId)).update(name, price, status);
});
