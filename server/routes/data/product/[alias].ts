import z from "zod"
import { ProductSEOItemResponse } from "#shared/types/product"
import { ProductPlan } from "~~/prisma/generated/enums"

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
            plan: true,
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
        plan: product.plan,
        publicId: product.publicId,
        alias: product.alias,
        name: product.name,
        price: product.price,
        createdAt: product.createdAt.toString(),
        imageLinks: product.files.map(file => file.publicId).map(id => `/storage/image?publicId=${id}`),
        categories: []
    }
})