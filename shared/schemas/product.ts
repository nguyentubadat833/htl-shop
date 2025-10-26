import z from "zod";

export const AddProductSchema = z.object({
  name: z.string(),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  images: z.array(z.string()).default([])
});

export const UpdateProductSchema = z.object({
  name: z.string().optional()
});
