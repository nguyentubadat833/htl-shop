import { CreateProductResponse } from "#shared/types/product";
import { AddProductSchema } from "#shared/schemas/product";
import { UserAuthContext } from "~~/server/utils/context-working";
import { ProductService } from "~~/server/core/service/product";
import { DefineOptionService } from "~~/server/core/service/option";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const userAuthContext = new UserAuthContext(event)

  const { name, price, info, category_publicIds } = zodValidateRequestOrThrow(AddProductSchema, await readBody(event));
  const product = await ProductService.create(name, price, info, userAuthContext.getUserIdOrThrow(), category_publicIds);

  void Object.entries(info).forEach(([key, value]) => {
    DefineOptionService.upsertOption(key, value)
  })

  return <CreateProductResponse>{
    publicId: product.publicId,
    name: product.name,
    price: product.price,
  };
});
