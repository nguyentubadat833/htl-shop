import { ProductService } from "~~/server/core/service/product";
import { S3 } from "~~/server/core/service/s3";
import { GetImageSchema } from "~~/shared/schemas/product";
import sharp from "sharp";
import { Readable } from "stream";
import { toWebStream } from "~~/server/utils/stream-helper";

export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery(event);
  const { publicId, custom } = zodValidateRequestOrThrow(GetImageSchema, query);

  const { objectName, bucket, contentType } = await ProductService.getFile(publicId, "IMAGE");
  const stream = await S3.CLIENT.getObject(bucket, objectName);

  // let outputStream: any;

  // if (custom) {
  //   const transformer = sharp().resize(custom.resize).jpeg({ quality: custom.quality });
  //   outputStream = Readable.toWeb(stream.pipe(transformer));
  // } else {
  //   outputStream = Readable.toWeb(stream);
  // }

  const transformer = sharp()
    .resize(custom?.resize ?? 300)
    .jpeg({ quality: custom?.quality ?? 70 });
  const outputStream: any = Readable.toWeb(stream.pipe(transformer));

  return new Response(toWebStream(outputStream), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
});
