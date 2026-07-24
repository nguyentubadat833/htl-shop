import z from "zod";

export const CreatePaymentSchema = z.object({
    order_id: z.string(),
    success_url: z.string(),
    cancel_url: z.string(),
    error_url: z.string(),
})