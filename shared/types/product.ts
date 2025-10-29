export interface CreateProductResponse {
  publicId: string;
  name: string;
  price: number;
}

export interface AddImageResponse {
  uploadLink: string;
}

// export interface ProductItemResponse {
//   publicId: string;
//   name: string;
//   price: number;
//   thumbnail_publicIds: string[];
// }

export interface ProductItemResponse {
  publicId: string;
  name: string;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  images: {
    publicId: string;
    thumbnail: boolean;
  }[];
}
