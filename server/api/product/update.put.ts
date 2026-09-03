import { ProductService } from "~~/server/core/service/product";
import { UpdateProductSchema } from "#shared/schemas/product";
import { DefineOptionService } from "~~/server/core/service/option";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { publicId, name, price, status, info, category_publicIds, plan, tagIds, externalLink } = zodValidateRequestOrThrow(UpdateProductSchema, await readBody(event));
  const product = await (await new ProductService().withPublicId(publicId)).update(name, price, info, status, category_publicIds, plan, tagIds, externalLink);

  void Object.entries(info).forEach(([key, value]) => {
    DefineOptionService.upsertOption(key, value);
  });

  return product;
});
