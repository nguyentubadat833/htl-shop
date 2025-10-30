import prisma from "~~/lib/prisma";
import { S3 } from "~~/server/core/service/s3";
import { DeleteImageSchema } from "~~/shared/schemas/product";

export default defineWrappedResponseHandler(async (event) => {
  UserAuthContext.hasAdminOrThrowInline(event);
  const { publicId } = zodValidateRequestOrThrow(DeleteImageSchema, await readBody(event));

  const result = await prisma.objectStorage.delete({
    where: {
      publicId,
    },
  });

  if (result) {
    void S3.CLIENT.removeObject(result.bucket, result.objectName);
  }

  setResponseStatus(event, 204);
  return;
});
