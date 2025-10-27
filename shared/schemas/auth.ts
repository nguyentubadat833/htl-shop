import z from "zod";

// export const GoogleVerifyTokenRequestSchema = z.object({
//   credential: z.string(),
// });

export const VerifyCodeRequestSchema = z.object({
  code: z.string(),
});
