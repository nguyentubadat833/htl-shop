import { ProductService } from "~~/server/core/service/product";
import { AddImageResponse } from "#shared/types/product";
import { UploadFileRequestSchema } from "#shared/schemas/product";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { publicId: product_publicId, file } = zodValidateRequestOrThrow(UploadFileRequestSchema, await readBody(event));
  return <AddImageResponse>{
    uploadLink: await (await new ProductService().withPublicId(product_publicId)).addFile(file.filename, file.size, file.type),
  };
});
