import { ProductService } from "~~/server/core/service/product";
import { UpdateProductSchema } from "~~/shared/schemas/product";
import { UserAuthContext } from "~~/server/utils/context-working";

export default defineWrappedResponseHandler(async (event) => {
  UserAuthContext.hasAdminOrThrowInline(event);

  const { publicId, name, price, status } = zodValidateRequestOrThrow(UpdateProductSchema, await readBody(event));
  return await (await new ProductService().withPublicId(publicId)).update(name, price, status);
});
