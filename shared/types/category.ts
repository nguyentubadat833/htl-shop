export enum CategoryType {
    TWO_D = '2D',
    THREE_D = '3D'
}

export interface CategoryProductItemResponse {
    publicId: string
    name: string
}

export interface CategoryItemResponse {
    publicId: string
    name: string
    type: string
    active: boolean
    products: CategoryProductItemResponse[]
}

export interface CategorySEOItem {
    publicId: string,
    alias: string,
    name: string,
    type: string,
    products: {
        count: number
    }
}