import prisma from "~~/lib/prisma";
import { RemoveThumbnailSchema } from "~~/shared/schemas/product";

export default defineWrappedResponseHandler(async (event) => {
  UserAuthContext.hasAdminOrThrowInline(event);
  const { publicId } = zodValidateRequestOrThrow(RemoveThumbnailSchema, await readBody(event));

  await prisma.objectStorage.update({
    where: {
      publicId: publicId,
    },
    data: {
      thumbnail: false,
    },
  });

  setResponseStatus(event, 204);
  return;
});
