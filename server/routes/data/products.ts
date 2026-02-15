import { ProductSEOItemResponse } from "#shared/types/product"
import { changeRate, getAmountVND } from "~~/server/core/service/money"

export default defineWrappedResponseHandler(async (event) => {
    const { get } = changeRate()
    const changeRateResult = await get()

    const data = await prisma.product.findMany({
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
                    name: true,
                    type: true
                }
            }
        }
    })
    return await Promise.all(
        data.map(async item => {
            return {
                plan: item.plan,
                publicId: item.publicId,
                alias: item.alias,
                name: item.name,
                price: item.price,
                priceVND: await getAmountVND(item.price, changeRateResult),
                createdAt: item.createdAt.toString(),
                imageLinks: item.files.map(file => file.publicId).map(id => `/storage/image?publicId=${id}`),
                categories: item.categories
            } satisfies ProductSEOItemResponse
        })
    )
})