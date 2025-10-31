import z, { size } from "zod";

const ProductBaseSchema = z.object({
  publicId: z.string(),
});

const FileBaseSchema = z.object({
  publicId: z.string(),
});

export const AddProductSchema = z.object({
  name: z.string(),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
});

export const UpdateProductSchema = ProductBaseSchema.extend({
  name: z.string().optional(),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const DeleteProductSchema = ProductBaseSchema.extend({});

export const UploadFileRequestSchema = ProductBaseSchema.extend({
  file: z.object({
    filename: z.string(),
    size: z.number(),
    type: z.enum(["DESIGN", "IMAGE"]),
  }),
});

export const DeleteFileRequestSchema = FileBaseSchema.extend({});

export const GetImageSchema = z.object({
  publicId: z.string(),
  custom: z
    .object({
      resize: z.coerce.number(),
      quality: z.coerce.number(),
    })
    .optional(),
});
