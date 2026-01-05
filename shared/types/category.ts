export enum CategoryType {
    TWO_D = '2D',
    THREE_D = '3D'
}

export interface CategoryItemResponse {
    publicId: string
    name: string
    type: string
    active: boolean
    products: {
        publicId: string
        name: string
    }[]
}