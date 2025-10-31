import { ProductService } from "~~/server/core/service/product";
import { AddImageResponse } from "~~/shared/types/product";
import { UserAuthContext } from "~~/server/utils/context-working";
import { UploadFileRequestSchema } from "~~/shared/schemas/product";

export default defineWrappedResponseHandler(async (event) => {
  UserAuthContext.hasAdminOrThrowInline(event);

  const { publicId: product_publicId, file } = zodValidateRequestOrThrow(UploadFileRequestSchema, await readBody(event));
  return <AddImageResponse>{
    uploadLink: await (await new ProductService().withPublicId(product_publicId)).addFile(file.filename, file.size, file.type),
  };
});
