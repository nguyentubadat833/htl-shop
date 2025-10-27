import prisma from "../../../lib/prisma";
import { AddProductSchema } from "#shared/schemas/product";
import { UserAuthContext } from "~~/server/utils/context-working";

export default defineWrappedResponseHandler(async (event) => {
  const { name, price, images } = zodValidateRequestOrThrow(AddProductSchema, await readBody(event));

  const product = await prisma.product.create({
    data: {
      name,
      price,
      createdByUserId: UserAuthContext.getUserAuthOrThrow.id,
    },
  });

  let rs = {
    publicId: product.publicId,
    name: product.name,
    price: product.price,
    uploadLinks: [] as string[],
  };

  if (images.length > 0) {
    rs.uploadLinks = await Promise.all(images.map((name) => S3.CLIENT.presignedPutObject(S3.BUCKET_UPLOAD_DEFAULT, `${Date.now()}_${name}`)));
  }

  return rs;
});
