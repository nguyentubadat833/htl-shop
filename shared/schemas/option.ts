import z from "zod";

export const BaseSchema = z.object({
    key: z.string()
})

export const GetOptionSchema = BaseSchema.extend({})
export const DeleteOptionSchema = BaseSchema.extend({})
export const AddOptionSchema = BaseSchema.extend({
    value: z.string()
})