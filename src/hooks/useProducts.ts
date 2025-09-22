import { useState, useCallback, useMemo, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { fetchProducts, fetchCategories } from '@/lib/productsApi';
import { debounce, sanitizeSearchInput, validateSearchInput } from '@/lib/utils/productUtils';
import { useUrlState } from './useUrlState';

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  oemNumber?: string;
  manufacturer?: string;
  price?: string | number;
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

export const useProducts = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [pageSize] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalItems] = useState(0);

  // URL state management
  const {
    searchTerm,
    categoryId: selectedCategoryId,
    page: currentPage,
    updateSearchTerm,
    updateCategoryId,
    updatePage,
  } = useUrlState();

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  // Frontend pagination - update displayed products when allProducts or currentPage changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    
    setProducts(paginatedProducts);
    setTotalItems(allProducts.length);
    setTotalPages(Math.ceil(allProducts.length / pageSize));
  }, [allProducts, currentPage, pageSize]);

  // Load categories
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setError(null);
    try {
      const response = await fetchCategories();
      if (response.success) {
        const cats = response.data || [];
        setCategories(cats);

        // Auto-select first category if none selected
        if (!selectedCategoryId && cats.length > 0) {
          updateCategoryId(cats[0].id);
        }
      } else {
        throw new Error(response.error || 'Failed to load categories');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
      setError(errorMessage);
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, [selectedCategoryId, updateCategoryId]);

  // Load products
  const loadProducts = useCallback(async () => {
    if (!selectedCategoryId) {
      setAllProducts([]);
      return;
    }

    setProductsLoading(true);
    setError(null);
    try {
      const response = await fetchProducts({
        categoryId: selectedCategoryId,
        search: searchTerm
      });
      
      if (response.success) {
        const prods = response.data || [];
        setAllProducts(prods);
      } else {
        throw new Error(response.error || 'Failed to load products');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      setError(errorMessage);
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setProductsLoading(false);
    }
  }, [selectedCategoryId, searchTerm]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((...args: unknown[]) => {
      const term = args[0] as string;
      const sanitized = sanitizeSearchInput(term);
      if (validateSearchInput(sanitized)) {
        updateSearchTerm(sanitized);
      }
    }, 300),
    [updateSearchTerm]
  );

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Filtered and paginated products
  // Backend returns already paginated results; expose products directly
  const filteredProducts = useMemo(() => products, [products]);
  const paginatedProducts = useMemo(() => products, [products]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadCategories(), loadProducts()]);
      notifications.show({
        title: "Success",
        message: "Products refreshed successfully",
        color: "green",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadProducts]);

  // Retry loading
  const retryLoad = useCallback(() => {
    if (error) {
      refreshData();
    }
  }, [error, refreshData]);

  return {
    // State
    categories,
    selectedCategoryId,
    products,
    loading,
    categoriesLoading,
    productsLoading,
    searchTerm,
    currentPage,
    pageSize,
    error,
    selectedCategory,
    filteredProducts,
    paginatedProducts,
    totalPages,
    
    // Actions
    setSelectedCategoryId: updateCategoryId,
    setCurrentPage: updatePage,
    loadCategories,
    loadProducts,
    handleSearchChange,
    refreshData,
    retryLoad,
  };
};

