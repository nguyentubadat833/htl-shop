import { ProductSEOItemResponse } from "#shared/types/product"
import { changeRate, getAmountVND } from "~~/server/core/service/money"

function toStringArray(value: unknown): string[] {
    if (!value) return []

    if (Array.isArray(value)) {
        return value.filter((v): v is string => typeof v === 'string')
    }

    return typeof value === 'string' ? [value] : []
}

export default defineWrappedResponseHandler(async (event) => {
    const queries = getQuery(event)

    const categoryTypes = toStringArray(queries.categoryTypes)
    const categoryPublicIds = toStringArray(queries.categoryPublicIds)

    const { get } = changeRate()
    const changeRateResult = await get()

    const data = await prisma.product.findMany({
        where: {
            status: 'ACTIVE',
            categories: {
                some: {
                    publicId: categoryPublicIds.length ? {
                        in: categoryPublicIds
                    } : undefined,
                    type: categoryTypes.length ? {
                        in: categoryTypes
                    } : undefined
                }
            }
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
                    type: true,
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