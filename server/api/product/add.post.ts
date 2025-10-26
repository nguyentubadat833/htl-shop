import prisma from "../../../lib/prisma";
import { AddProductSchema } from "#shared/schemas/product";
import { defineWrappedResponseHandler, UserAuthContext } from "~~/server/utils/context-working";
import { BUCKET_UPLOAD_DEFAULT, s3Client } from "~~/server/utils/s3";

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
    rs.uploadLinks = await Promise.all(images.map((name) => s3Client.presignedPutObject(BUCKET_UPLOAD_DEFAULT, `${Date.now()}_${name}`)));
  }

  return rs;
});
