import z from "zod";

const OrderBaseSchema = z.object({
  publicId: z.string(),
});

export const CreateOrderSchema = z.object({
  product_publicIds: z.array(z.string()),
});

export const RemoveOrderItemsSchema = OrderBaseSchema;

export const AddOrderItemsSchema = OrderBaseSchema.extend({
  product_publicIds: z.array(z.string()),
});

export const CancelOrderSchema = OrderBaseSchema;
