import z from "zod";

export const CreateOrderSchema = z.object({
  product_publicIds: z.array(z.string()),
});

export const RemoveOrderItemsSchema = CreateOrderSchema.extend({
  publicId: z.string(),
});

export const AddOrderItemsSchema = RemoveOrderItemsSchema.extend({});

export const CancelOrderSchema = z.object({
  publicId: z.string(),
});
