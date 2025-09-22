// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Product {
  id: string;
  name: string;
  description?: string;
  oemNumber?: string;
  manufacturer?: string;
  price?: string | number; // Can be string (from API) or number
  imageUrl?: string;
  categoryId: string;
  subcategoryId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  error?: string;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
  error?: string;
}

// Fetch products with filters (no pagination)
export async function fetchProducts(params: {
  search?: string;
  categoryId?: string;
}): Promise<ProductsResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);

    const response = await fetch(`/api/products?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      },
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    };
  }
}

// Fetch categories
export async function fetchCategories(): Promise<CategoriesResponse> {
  try {
    const response = await fetch(`/api/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    };
  }
}

// Fetch single product by ID
export async function fetchProductById(productId: string): Promise<ProductResponse> {
  try {
    const response = await fetch(`/api/proxy/products/${productId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return {
      success: false,
      data: {} as Product,
      error: error instanceof Error ? error.message : 'Failed to fetch product details'
    };
  }
}

// Fetch products by category
export async function fetchProductsByCategory(categoryId: string, params?: {
  search?: string;
}): Promise<ProductsResponse> {
  return fetchProducts({
    categoryId,
    ...params
  });
}

// Search products
export async function searchProducts(searchTerm: string, params?: {
  categoryId?: string;
}): Promise<ProductsResponse> {
  return fetchProducts({
    search: searchTerm,
    ...params
  });
}

