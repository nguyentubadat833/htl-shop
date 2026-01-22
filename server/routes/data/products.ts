import { ProductSEOItemResponse } from "#shared/types/product"
import { ProductPlan } from "~~/prisma/generated/enums"

export default defineWrappedResponseHandler(async (event) => {
    return await prisma.product.findMany({
        where: {
            status: 'ACTIVE'
        },
        include: {
            files: {
                where: {
                    type: 'IMAGE'
                },
                select: {
                    publicId: true
                }
            },
            categories: {
                where: {
                    active: true
                },
                select: {
                    alias: true,
                    publicId: true,
                    name: true
                }
            }
        }
    }).then(data => data.map(item => {
        return <ProductSEOItemResponse>{
            plan: ProductPlan.PRO,
            publicId: item.publicId,
            alias: item.alias,
            name: item.name,
            price: item.price,
            createdAt: item.createdAt.toString(),
            imageLinks: item.files.map(file => file.publicId).map(id => `/storage/image?publicId=${id}`),
            categories: item.categories
        }
    }))
})