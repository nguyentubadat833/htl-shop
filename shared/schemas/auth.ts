import z from "zod";

export const GoogleVerifyTokenRequestSchema = z.object({
    credential: z.string()
})