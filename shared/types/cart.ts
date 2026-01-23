import type { ProductPlan } from "~~/prisma/generated/browser";

export interface CartItemResponse {
  cartId: string;
  product: {
    publicId: string
    plan: ProductPlan,
    name: string;
    alias: string
    price: number;
    createdAt: string;
    imageLinks: string[]
  }
}