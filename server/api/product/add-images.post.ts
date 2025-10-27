import { ProductService } from "~~/server/core/service/product";
import { AddImagesSchema } from "~~/shared/schemas/product";
import { AddImagesResponse } from "~~/shared/types/product";

export default defineWrappedResponseHandler(async (event) => {
  const req = zodValidateRequestOrThrow(AddImagesSchema, await readBody(event));

  return <AddImagesResponse>{
    uploadLinks: await (await new ProductService().withPublicId(req.productPublicId)).addImages(req.images),
  };
});
