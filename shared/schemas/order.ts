import z, { string } from "zod";

const OrderBaseSchema = z.object({
  publicId: z.string(),
});

export const CreateOrderSchema = z.object({
  product_publicIds: z.array(z.string()),
});

export const RemoveOrderItemsSchema = z.object({
  order_publicId: z.string(),
  product_publicIds: z.array(z.string())
});

export const AddOrderItemsSchema = OrderBaseSchema.extend({
  product_publicIds: z.array(z.string()),
});

export const CancelOrderSchema = OrderBaseSchema;
