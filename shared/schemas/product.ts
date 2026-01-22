import z from "zod";
import { ProductPlan, ProductStatus } from "~~/prisma/generated/enums";

const ProductBaseSchema = z.object({
  publicId: z.string(),
})

export const ProductInfoSchema = z.object({
  platform: z.string().default(''),
  render: z.string().default(''),
  size: z.string().default(''),
  colors: z.string().default(''),
  style: z.string().default(''),
  materials: z.string().default(''),
  formfactor: z.string().default(''),
  description: z.string().default('')
})

const FileBaseSchema = z.object({
  publicId: z.string(),
});

export const AddProductSchema = z.object({
  plan: z.enum(ProductPlan),
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  info: ProductInfoSchema,
  category_publicIds: z.array(z.string()).default([])
});

export const UpdateProductSchema = ProductBaseSchema.extend({
  plan: z.enum(ProductPlan).optional(),
  name: z.string().optional(),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0").optional(),
  status: z.enum(ProductStatus).optional(),
  info: ProductInfoSchema,
  category_publicIds: z.array(z.string())
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
