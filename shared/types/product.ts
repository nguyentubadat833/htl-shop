import type z from "zod";
import type { ProductInfoSchema } from "../schemas/product";
import type { Product, ProductPlan, ProductStatus } from "~~/prisma/generated/browser";

export type FileType = "IMAGE" | "DESIGN";

export interface CreateProductResponse {
  publicId: string;
  name: string;
  price: number;
}

export interface AddImageResponse {
  uploadLink: string;
}

export type ProductInfo = z.output<typeof ProductInfoSchema>;

export interface ProductItemResponse {
  publicId: string;
  plan: ProductPlan;
  name: string;
  price: number;
  status: ProductStatus;
  createdAt: string | undefined;
  updatedAt: string | undefined;
  info: ProductInfo;
  files: {
    publicId: string;
    type: FileType;
  }[];
  categoryIds: string[]
  tagIds: string[]
  externalLink?: string
}

export interface ProductSEOItemResponse {
  publicId: string;
  plan: ProductPlan;
  alias: string;
  name: string;
  price: number;
  priceVND: number;
  createdAt: string;
  imageLinks: string[];
  info: ProductInfo,
  categories: {
    alias: string;
    publicId: string;
    name: string;
    type: string;
  }[];
}

export interface ProductPurchased {
  publicId: string;
  alias: string;
  name: string;
  fileId?: string | null
  imageLinks: string[];
  purchasedAt: string;
  externalLink?: string
  plan: ProductPlan
}
