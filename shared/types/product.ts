import type z from "zod";
import type { ProductInfoSchema } from "../schemas/product";
import type { ProductPlan, ProductStatus } from "~~/prisma/generated/enums";

export type FileType = "IMAGE" | "DESIGN";

export interface CreateProductResponse {
  publicId: string;
  name: string;
  price: number;
}

export interface AddImageResponse {
  uploadLink: string;
}

export type ProductInfo = z.output<typeof ProductInfoSchema>

export interface ProductItemResponse {
  publicId: string;
  plan: ProductPlan,
  name: string;
  price: number;
  status: ProductStatus;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  info: ProductInfo
  files: {
    publicId: string;
    type: FileType;
  }[];
  categories: {
    publicId: string
  }[]
}

// export enum ProductPlan {
//   Free = "Free",
//   Pro = "Pro"
// }

export interface ProductSEOItemResponse {
  publicId: string;
  plan: string,
  alias: string
  name: string;
  price: number;
  priceVND: number;
  createdAt: string;
  imageLinks: string[]
  categories: {
    alias: string,
    publicId: string,
    name: string
  }[]
}
