import { ProductService } from "~~/server/core/service/product";
import { S3 } from "~~/server/core/service/s3";
import z from "zod";

const ParamsSchema = z.object({
  id: z.string(),
});

export default defineWrappedRequiredAdminHandler(async (event) => {
  const params = getRouterParams(event);
  const { id: publicId } = zodValidateRequestOrThrow(ParamsSchema, params);

  const { objectName, bucket } = await ProductService.getFile(publicId, "DESIGN");
  const expiresInSeconds = 60 * 5;
  // return await S3.CLIENT.presignedGetObject(bucket, objectName, expiresInSeconds);
  const asciiFallback = objectName.replace(/[^\x20-\x7E]/g, "_"); // fallback an toàn
  const encodedName = encodeURIComponent(objectName);

  return await S3.CLIENT.presignedGetObject(bucket, objectName, expiresInSeconds, {
    "response-content-disposition": `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedName}`,
  });
});
