import { ProductService } from "~~/server/core/service/product";
import { AddImageSchema } from "~~/shared/schemas/product";
import { AddImageResponse } from "~~/shared/types/product";
import { UserAuthContext } from "~~/server/utils/context-working";

export default defineWrappedResponseHandler(async (event) => {
  UserAuthContext.hasAdminOrThrowInline(event);

  const req = zodValidateRequestOrThrow(AddImageSchema, await readBody(event));
  return <AddImageResponse>{
    uploadLink: await (await new ProductService().withPublicId(req.productPublicId)).addImage(req.image.filename, req.image.thumbnail),
  };
});
