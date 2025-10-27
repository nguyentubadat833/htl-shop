import { ProductService } from "~~/server/core/service/product";
import { S3 } from "~~/server/core/service/s3";

export default defineWrappedResponseHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    setResponseStatus(event, 404);
    return;
  }

  const { objectName, bucket, contentType } = await ProductService.getThumbnail(id);
  const stream = await S3.CLIENT.getObject(bucket, objectName);

  return new Response(toWebStream(stream), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
});

function toWebStream(nodeStream: import("stream").Readable): ReadableStream {
  const reader = nodeStream[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await reader.next();
      if (done) return controller.close();
      controller.enqueue(value);
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}
