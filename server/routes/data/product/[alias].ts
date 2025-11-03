import z from "zod"
import prisma from "~~/lib/prisma"
import { ProductPlan, ProductSEOItemResponse } from "~~/shared/types/product"

export default defineWrappedResponseHandler(async (event) => {
    const { alias } = zodValidateRequestOrThrow(z.object({
        alias: z.string()
    }), getRouterParams(event))

    const product = await prisma.product.findUnique({
        where: {
            alias: alias
        },
        select: {
            alias: true,
            publicId: true,
            name: true,
            price: true,
            createdAt: true,
            files: {
                where: {
                    type: 'IMAGE'
                },
                select: {
                    publicId: true
                }
            }
        }
    })

    if (!product) {
        throw new ServerError("Not found", 404)
    }

    return <ProductSEOItemResponse>{
        plan: ProductPlan.Pro,
        publicId: product.publicId,
        alias: product.alias,
        name: product.name,
        price: product.price,
        createdAt: product.createdAt,
        imageLinks: product.files.map(file => file.publicId).map(id => `/storage/image?publicId=${id}`)
    }
})