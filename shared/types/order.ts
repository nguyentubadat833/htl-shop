export interface OrderWithProductsResponse{
    publicId: string
    status: string
    amount: number
    products: {
        name: string
        price: number
    }[]
}