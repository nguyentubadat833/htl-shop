import { ProductService } from "~~/server/core/service/product";
import { DeleteProductSchema } from "~~/shared/schemas/product";
import { UserAuthContext } from "~~/server/utils/context-working";

export default defineWrappedResponseHandler(async (event) => {
  const userAuthContext = new UserAuthContext(event)
  userAuthContext.hasAdminOrThrow()

  const { publicId } = zodValidateRequestOrThrow(DeleteProductSchema, await readBody(event));
  await (await new ProductService().withPublicId(publicId)).softDelete();
  setResponseStatus(event, 204);
  return;
});
