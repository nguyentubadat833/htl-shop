import z from "zod";
export const AddProductSchema = z.object({
  name: z.string(),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  // images: z.array(z.string()).default([]),
});

export const AddImageSchema = z.object({
  product_publicId: z.string(),
  image: z.object({
    filename: z.string(),
    thumbnail: z.boolean().default(false),
  }),
});

export const UpdateProductSchema = z.object({
  publicId: z.string(),
  name: z.string().optional(),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const GetImageSchema = z.object({
  publicId: z.string(),
  custom: z
    .object({
      resize: z.coerce.number(),
      quality: z.coerce.number(),
    })
    .optional(),
});

export const DeleteProductSchema = z.object({
  publicId: z.string(),
});

export const RemoveThumbnailSchema = z.object({
  publicId: z.string(),
});

export const DeleteImageSchema = z.object({
  publicId: z.string(),
});
