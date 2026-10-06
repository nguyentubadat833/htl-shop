import z from "zod";

export const CreatePaymentSchema = z.object({
    order_id: z.string().min(1),
    success_url: z.url(),
    cancel_url: z.url(),
    error_url: z.url(),
})