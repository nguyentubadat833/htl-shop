import { CreateProductResponse } from "#shared/types/product";
import { AddProductSchema } from "#shared/schemas/product";
import { UserAuthContext } from "~~/server/utils/context-working";
import { ProductService } from "~~/server/core/service/product";

export default defineWrappedResponseHandler(async (event) => {
  const { name, price, images } = zodValidateRequestOrThrow(AddProductSchema, await readBody(event));

  const product = await ProductService.create(name, price, UserAuthContext.getUserAuthOrThrow.id);

  let rs: CreateProductResponse = {
    publicId: product.publicId,
    name: product.name,
    price: product.price,
    uploadLinks: [],
  };

  if (images.length > 0) {
    rs.uploadLinks = await new ProductService(product).addImages(images);
  }

  return rs;
});
