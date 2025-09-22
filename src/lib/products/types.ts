export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  manufacturerName: string;
  manufacturerNumber: string;
  weight: string;
  packageDimension: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiListParams {
  categoryId?: string;
}



