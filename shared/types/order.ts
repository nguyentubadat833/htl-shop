// export type OrderStatus = 'PENDING' | 'PAID' | 'SENDING' | 'DELIVERED' | 'CANCELLED'
// export type PaymentMethod = 'STRIPE' | 'PAYPAL' | 'MOMO' | 'VNPAY' | 'MANUAL'
// export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
import { OrderStatus, PaymentMethod, PaymentStatus } from "~~/prisma/generated/browser";

export interface OrderWithProductsResponse {
  publicId: string;
  status: string;
  amount: number;
  products: {
    name: string;
    price: number;
  }[];
}

export interface ProductOrderItemResponse {
  productAlias: string
  productPublicId: string;
  productName: string;
  price: number;
}

export interface PaymentOrderItemResponse {
  transactionId?: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface OrderItemResponse {
  publicId: string;
  status: OrderStatus;
  amount: number;
  orderAt: string;
  orderByUser: {
    publicId: string;
    name: string;
    email: string;
  };
  items: ProductOrderItemResponse[];
  payments: PaymentOrderItemResponse[];
}
