import z from "zod";

export const AddProductSchema = z.object({
  name: z.string(),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  images: z.array(z.string()).default([]),
});

export const AddImagesSchema = z.object({
  productPublicId: z.string(),
  images: z.array(z.string()).min(1, "Phải có ít nhất một hình ảnh để thêm"),
});

export const UpdateProductSchema = z.object({
  publicId: z.string(),
  name: z.string().optional(),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const DeleteProductSchema = z.object({
  publicId: z.string(),
});
