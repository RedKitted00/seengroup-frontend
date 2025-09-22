import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { 
  fetchFilteredProducts, 
  fetchFilterCategories, 
  fetchManufacturers,
  searchProductsAutocomplete,
  ProductFilter,
  FilterCategory
} from '@/lib/api/productFilterApi';
import { debounce } from '@/lib/utils/productUtils';

export interface FilterState {
  auxiliary: string[]; // Now used for category IDs
  components: string[];
  products: string[];
  parts: string[];
}

export interface UseProductFilterReturn {
  // State
  products: ProductFilter[];
  categories: FilterCategory[];
  manufacturers: string[];
  loading: boolean;
  categoriesLoading: boolean;
  manufacturersLoading: boolean;
  error: string | null;
  searchQuery: string;
  activeFilters: FilterState;
  activeAccordion: string;
  viewMode: 'grid' | 'list';
  selectedProduct: ProductFilter | null;
  isModalOpen: boolean;
  autocompleteSuggestions: string[];
  
  // Pagination state
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: FilterState) => void;
  setActiveAccordion: (accordion: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSelectedProduct: (product: ProductFilter | null) => void;
  setIsModalOpen: (open: boolean) => void;
  setCurrentPage: (page: number) => void;
  
  // Functions
  handleSearch: (query: string, category?: string) => void;
  handleFilterChange: (category: keyof FilterState, value: string, checked: boolean) => void;
  handleViewToggle: (mode: 'grid' | 'list') => void;
  openProductModal: (product: ProductFilter) => void;
  closeModal: () => void;
  clearAllFilters: () => void;
  switchToCategory: (categoryId: string) => void;
  getActiveFilterCount: () => number;
  refreshData: () => Promise<void>;
  handlePageChange: (page: number) => void;
}

export const useProductFilter = (): UseProductFilterReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params and localStorage
  const getInitialState = () => {
    // Get from URL params first
    const urlSearch = searchParams.get('search') || '';
    const urlViewMode = (searchParams.get('view') as 'grid' | 'list') || 'grid';
    const urlAccordion = searchParams.get('accordion') || 'auxiliary';
    
    // Get filters from URL
    const urlFilters: FilterState = {
      auxiliary: searchParams.get('auxiliary')?.split(',').filter(Boolean) || [],
      components: searchParams.get('components')?.split(',').filter(Boolean) || [],
      products: searchParams.get('products')?.split(',').filter(Boolean) || [],
      parts: searchParams.get('parts')?.split(',').filter(Boolean) || []
    };
    
    // Fallback to localStorage if URL is empty
    if (!urlSearch && !Object.values(urlFilters).some(f => f.length > 0)) {
      try {
        const stored = localStorage.getItem('product-filters');
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            search: parsed.search || '',
            viewMode: parsed.viewMode || 'grid',
            accordion: parsed.accordion || 'auxiliary',
            filters: parsed.filters || {
              auxiliary: [],
              components: [],
              products: [],
              parts: []
            }
          };
        }
      } catch (error) {
        console.warn('Failed to parse stored filters:', error);
      }
    }
    
    return {
      search: urlSearch,
      viewMode: urlViewMode,
      accordion: urlAccordion,
      filters: urlFilters
    };
  };
  
  const initialState = getInitialState();
  
  // Basic UI state
  const [activeAccordion, setActiveAccordion] = useState(initialState.accordion);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialState.viewMode);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(initialState.search);
  const [activeFilters, setActiveFilters] = useState<FilterState>(initialState.filters);
  
  // Product data state
  const [allProducts, setAllProducts] = useState<ProductFilter[]>([]);
  const [products, setProducts] = useState<ProductFilter[]>([]);
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [manufacturersLoading, setManufacturersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductFilter | null>(null);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(5);

  // Frontend pagination - update displayed products when allProducts or currentPage changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    
    setProducts(paginatedProducts);
    setTotalItems(allProducts.length);
    setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
  }, [allProducts, currentPage, itemsPerPage]);

  const saveToLocalStorage = useCallback((data: {
    search: string;
    viewMode: 'grid' | 'list';
    accordion: string;
    filters: FilterState;
  }) => {
    try {
      localStorage.setItem('product-filters', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setError(null);
    try {
      const response = await fetchFilterCategories();
      if (response.success) {
        setCategories(response.data);
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
  }, []);

  // Load manufacturers
  const loadManufacturers = useCallback(async () => {
    setManufacturersLoading(true);
    setError(null);
    try {
      const response = await fetchManufacturers();
      if (response.success) {
        setManufacturers(response.data);
      } else {
        throw new Error(response.error || 'Failed to load manufacturers');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load manufacturers';
      setError(errorMessage);
    } finally {
      setManufacturersLoading(false);
    }
  }, []);

  // Load products with filters
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Determine selected category (exclude "Show All")
      const selectedCategory = activeFilters.auxiliary.find((v) => v && v !== 'Show All');
      // Determine subcategories; treat 'Show All' as no specific subcategory
      const selectedSubcategories = activeFilters.components.filter(v => v !== 'Show All');

      // Convert FilterState to Record<string, string[]> format
      const filtersRecord: Record<string, string[]> = {
        auxiliary: activeFilters.auxiliary,
        components: selectedSubcategories,
        products: activeFilters.products,
        parts: activeFilters.parts
      };
      
      const response = await fetchFilteredProducts({
        search: searchQuery,
        category: selectedCategory,
        subcategory: selectedSubcategories.length === 1 ? selectedSubcategories[0] : undefined,
        filters: filtersRecord
      });
      
      if (response.success) {
        setAllProducts(response.data);
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
      setLoading(false);
    }
  }, [searchQuery, activeFilters]);

  // Debounced search with autocomplete
  const debouncedSearch = useMemo(
    () => debounce(async (...args: unknown[]) => {
      const query = args[0] as string;
      if (query && query.length >= 2) {
        try {
          const response = await searchProductsAutocomplete(query);
          if (response.success) {
            setAutocompleteSuggestions(response.data);
          }
        } catch (error) {
          console.error('Autocomplete error:', error);
        }
      } else {
        setAutocompleteSuggestions([]);
      }
    }, 300),
    []
  );

  // Handle search
  const handleSearch = useCallback((query: string, category?: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
    
    // If category is provided, update accordion
    if (category) {
      setActiveAccordion(category);
    }
    
    // Reset to first page when searching
    setCurrentPage(1);
    
    // Save to localStorage immediately
    saveToLocalStorage({
      search: query,
      viewMode,
      accordion: activeAccordion,
      filters: activeFilters
    });
  }, [debouncedSearch, saveToLocalStorage, viewMode, activeAccordion, activeFilters]);

  // Handle filter changes with exclusive category selection
  const handleFilterChange = useCallback((category: keyof FilterState, value: string, checked: boolean) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (checked) {
        // For category selection, implement exclusive behavior
        if (category === 'auxiliary' && value !== 'Show All') {
          // When selecting a specific category, clear all other category selections
          // This ensures only one category is active at a time
          newFilters.auxiliary = [value]; // Only the selected category
          // Default subcategories to "Show All" under the selected parent
          newFilters.components = ['Show All'];
          newFilters.products = [];       // Clear products  
          newFilters.parts = [];          // Clear parts
        } else if (category === 'auxiliary' && value === 'Show All') {
          // When "Show All" is selected, clear all specific category selections
          newFilters.auxiliary = ['Show All'];
          newFilters.components = ['Show All'];
          newFilters.products = [];
          newFilters.parts = [];
        } else if (category === 'components') {
          // Subcategory selection behavior - exclusive selection (single subcategory only)
          if (value === 'Show All') {
            newFilters.components = ['Show All'];
          } else {
            // When selecting a specific subcategory, clear all others and select only this one
            newFilters.components = [value];
          }
        } else {
          // For non-category filters, add value normally
          if (!newFilters[category].includes(value)) {
            newFilters[category] = [...newFilters[category], value];
          }
        }
      } else {
        // Remove value from category
        newFilters[category] = newFilters[category].filter(v => v !== value);
        
        // If removing the last item from auxiliary, default to "Show All"
        if (category === 'auxiliary' && newFilters.auxiliary.length === 0) {
          newFilters.auxiliary = ['Show All'];
          newFilters.components = ['Show All'];
        }
        // If subcategories become empty, default back to 'Show All'
        if (category === 'components' && newFilters.components.length === 0) {
          newFilters.components = ['Show All'];
        }
      }
      
      // Reset to first page when filters change
      setCurrentPage(1);
      
      // Save to localStorage immediately
      saveToLocalStorage({
        search: searchQuery,
        viewMode,
        accordion: activeAccordion,
        filters: newFilters
      });
      
      return newFilters;
    });
  }, [saveToLocalStorage, searchQuery, viewMode, activeAccordion]);

  // Handle view toggle
  const handleViewToggle = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
    
    // Save to localStorage immediately
    saveToLocalStorage({
      search: searchQuery,
      viewMode: mode,
      accordion: activeAccordion,
      filters: activeFilters
    });
  }, [saveToLocalStorage, searchQuery, activeAccordion, activeFilters]);

  // Open product modal
  const openProductModal = useCallback((product: ProductFilter) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const emptyFilters = {
      auxiliary: ['Show All'], // Default to "Show All" instead of empty
      components: [],
      products: [],
      parts: []
    };
    
    setActiveFilters(emptyFilters);
    setSearchQuery('');
    setAutocompleteSuggestions([]);
    
    // Save to localStorage immediately
    saveToLocalStorage({
      search: '',
      viewMode,
      accordion: activeAccordion,
      filters: emptyFilters
    });
  }, [saveToLocalStorage, viewMode, activeAccordion]);

  // Switch to a specific category (exclusive selection)
  const switchToCategory = useCallback((categoryId: string) => {
    const newFilters = {
      auxiliary: [categoryId],
      components: [],
      products: [],
      parts: []
    };
    
    setActiveFilters(newFilters);
    
    // Save to localStorage immediately
    saveToLocalStorage({
      search: searchQuery,
      viewMode,
      accordion: activeAccordion,
      filters: newFilters
    });
  }, [saveToLocalStorage, searchQuery, viewMode, activeAccordion]);

  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
    return Object.values(activeFilters).reduce((total, filters) => total + filters.length, 0);
  }, [activeFilters]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadCategories(), loadManufacturers(), loadProducts()]);
      notifications.show({
        title: "Success",
        message: "Data refreshed successfully",
        color: "green",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadManufacturers, loadProducts]);

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadManufacturers();
  }, [loadCategories, loadManufacturers]);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Update URL when filters, search, or view mode changes (after render)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update search
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    
    // Update view mode
    params.set('view', viewMode);
    
    // Update accordion
    params.set('accordion', activeAccordion);
    
    // Update filters
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      } else {
        params.delete(key);
      }
    });
    
    const newURL = `${window.location.pathname}?${params.toString()}`;
    const currentURL = window.location.pathname + window.location.search;
    
    // Only update if URL actually changed
    if (newURL !== currentURL) {
      router.replace(newURL, { scroll: false });
    }
  }, [searchQuery, viewMode, activeAccordion, activeFilters, router, searchParams]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Reset page when filters or search change
  // const resetPage = useCallback(() => {
  //   setCurrentPage(1);
  // }, []);

  return {
    // State
    products,
    categories,
    manufacturers,
    loading,
    categoriesLoading,
    manufacturersLoading,
    error,
    searchQuery,
    activeFilters,
    activeAccordion,
    viewMode,
    selectedProduct,
    isModalOpen,
    autocompleteSuggestions,
    
    // Pagination state
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    
    // Actions
    setSearchQuery,
    setActiveFilters,
    setActiveAccordion,
    setViewMode,
    setSelectedProduct,
    setIsModalOpen,
    setCurrentPage,
    
    // Functions
    handleSearch,
    handleFilterChange,
    handleViewToggle,
    openProductModal,
    closeModal,
    clearAllFilters,
    switchToCategory,
    getActiveFilterCount,
    refreshData,
    handlePageChange,
  };
};

