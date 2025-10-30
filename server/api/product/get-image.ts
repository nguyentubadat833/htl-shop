import sharp from "sharp";
import { ProductService } from "~~/server/core/service/product";
import { GetImageSchema } from "~~/shared/schemas/product";
import { Readable } from "stream";
import { S3 } from "~~/server/core/service/s3";

export default defineWrappedResponseHandler(async (event) => {
  UserAuthContext.hasAdminOrThrowInline(event);
  const query = getQuery(event);
  const { publicId, custom } = zodValidateRequestOrThrow(GetImageSchema, query);

  const { objectName, bucket, contentType } = await ProductService.getImage(publicId, false);
  const stream = await S3.CLIENT.getObject(bucket, objectName);

  const transformer = sharp()
    .resize(custom?.resize ?? 400)
    .jpeg({ quality: custom?.quality ?? 50 });
  const outputStream: any = Readable.toWeb(stream.pipe(transformer));

  return new Response(toWebStream(outputStream), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
});
