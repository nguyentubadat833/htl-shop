export interface CreateProductResponse {
  publicId: string;
  name: string;
  price: number;
  uploadLinks: string[];
}

export interface AddImagesResponse {
  uploadLinks: string[];
}

export interface ProductItemResponse {
  publicId: string;
  name: string;
  price: number;
}
