import type { OrderStatus } from "~~/prisma/generated/enums";

export const orderPaidValues: OrderStatus[] = ['PAID', 'SENDING', 'DELIVERED'] as const