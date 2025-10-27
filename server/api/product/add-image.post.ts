import { ProductService } from "~~/server/core/service/product";
import { AddImageSchema } from "~~/shared/schemas/product";
import { AddImageResponse } from "~~/shared/types/product";

export default defineWrappedResponseHandler(async (event) => {
  const req = zodValidateRequestOrThrow(AddImageSchema, await readBody(event));

  return <AddImageResponse>{
    uploadLink: await (await new ProductService().withPublicId(req.productPublicId)).addImage(req.image.filename, req.image.thumbnail),
  };
});
