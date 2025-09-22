// API Configuration
const API_CONFIG = {
  // Backend API base URL
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  
  // API endpoints
  ENDPOINTS: {
    CONTACT: '/api/contact',
    PRODUCTS: '/api/products',
    CATEGORIES: '/api/categories',
    AUTH: '/api/auth',
    CAREER: '/api/career',
    ANALYTICS: '/api/analytics'
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000
  }
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get contact API URL
export const getContactApiUrl = () => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.CONTACT);
};

// Helper function to get products API URL
export const getProductsApiUrl = () => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS);
};

// Helper function to get categories API URL
export const getCategoriesApiUrl = () => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES);
};

export default API_CONFIG;

