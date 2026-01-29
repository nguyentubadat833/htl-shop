import z from "zod";

export const CreateSepayPaymentSchema = z.object({
    orderId: z.string(),
    origin: z.string()
})