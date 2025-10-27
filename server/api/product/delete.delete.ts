import { ProductService } from "~~/server/core/service/product";
import { DeleteProductSchema } from "~~/shared/schemas/product";

export default defineWrappedResponseHandler(async (event) => {
  const { publicId } = zodValidateRequestOrThrow(DeleteProductSchema, await readBody(event));
  await (await new ProductService().withPublicId(publicId)).softDelete();
  setResponseStatus(event, 204);
  return;
});
