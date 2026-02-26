import z from "zod";

export const CreatePaymentSchema = z.object({
    orderId: z.string(),
    origin: z.string()
})