import { ProductPlan, ProductSEOItemResponse } from "~~/shared/types/product"

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
            }
        }
    }).then(data => data.map(item => {
        return <ProductSEOItemResponse>{
            plan: ProductPlan.Pro,
            publicId: item.publicId,
            alias: item.alias,
            name: item.name,
            price: item.price,
            createdAt: item.createdAt,
            imageLinks: item.files.map(file => file.publicId).map(id => `/storage/image?publicId=${id}`)
        }
    }))   
})