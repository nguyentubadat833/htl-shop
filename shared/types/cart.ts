import type { ProductPlan } from "./product";

export interface CartItemResponse {
  cartId: string;
  product: {
    plan: ProductPlan,
    name: string;
    alias: string
    price: number;
    createdAt: Date;
    imageLinks: string[]
  }
}