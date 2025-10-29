import { CreateProductResponse } from "#shared/types/product";
import { AddProductSchema } from "#shared/schemas/product";
import { UserAuthContext } from "~~/server/utils/context-working";
import { ProductService } from "~~/server/core/service/product";

export default defineWrappedResponseHandler(async (event) => {
  const userAuthContext = UserAuthContext.hasAdminOrThrowInline(event);

  const { name, price } = zodValidateRequestOrThrow(AddProductSchema, await readBody(event));

  const product = await ProductService.create(name, price, userAuthContext.getUserIdOrThrow());

  return <CreateProductResponse>{
    publicId: product.publicId,
    name: product.name,
    price: product.price,
  };
});
