import z from "zod";

export const CreateSepayPaymentSchema = z.object({
    orderPublicId: z.string()
})