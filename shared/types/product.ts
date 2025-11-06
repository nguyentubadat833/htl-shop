export type FileType = "IMAGE" | "DESIGN";

export interface CreateProductResponse {
  publicId: string;
  name: string;
  price: number;
}

export interface AddImageResponse {
  uploadLink: string;
}

export interface ProductItemResponse {
  publicId: string;
  name: string;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
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
