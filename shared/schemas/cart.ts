import z from "zod";

export const AddProductToCartSchema = z.object({
    product_publicId: z.string()
})

export const RemoveProductsInCartSchema = z.object({
    product_publicIds: z.array(z.string())
})

export const CheckoutInCartSchema = z.object({
    product_publicIds: z.array(z.string())
})