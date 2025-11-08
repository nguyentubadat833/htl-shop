import type z from "zod";
import type { ProductInfoSchema } from "../schemas/product";

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
  name: string;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  info: ProductInfo
  files: {
    publicId: string;
    type: FileType;
  }[];
}

export enum ProductPlan {
  Free = "Free",
  Pro = "Pro"
}

export interface ProductSEOItemResponse {
  publicId: string;
  plan: ProductPlan,
  alias: string
  name: string;
  price: number;
  createdAt: Date;
  imageLinks: string[]
}
