import React from 'react';
import { ProductFilter } from '@/lib/api/productFilterApi';
import { LoadingState } from '@/app/components/LoadingState';
import Pagination from '../ui/Pagination';

interface ProductListProps {
  products: ProductFilter[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  onProductClick: (product: ProductFilter) => void;
  onRetry: () => void;
  // Pagination props
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  error,
  viewMode,
  searchQuery,
  onProductClick,
  onRetry,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {
  if (loading) {
    return <LoadingState message="Loading products..." />;
  }
  if (error) {
    return (
      <div className="sei-error-state">
        <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
        <p>{error}</p>
        <button onClick={onRetry} className="sei-btn sei-btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
  
    return (
      <div className="sei-no-results">
        <i className="fa fa-search" aria-hidden="true"></i>
        <p>
          {searchQuery 
            ? `No products found matching "${searchQuery}"`
            : "No products available in this category"
          }
        </p>
        {searchQuery && (
          <button 
            onClick={() => window.location.reload()}
            className="sei-btn sei-btn-secondary"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`sei-product-list sei-sw-right-prod-list-content ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
      {/* Product Details Description */}
      <div className="sei-product-details-discription">
        {/* Product Description Start */}
        <div className="sei-peodct-discription-content">
          <div className="sei-product-content-d">
            <h1 className="sei-product-title">Marine or Railway - We got you covered!</h1>
            <p className="sei-product-content-c">
              Comprehensive collection of high-quality industrial parts and components 
              for both marine and railway applications. From marine engines and propulsion 
              systems to locomotive components and rail infrastructure - we provide reliable 
              solutions for your specific requirements across both industries.
            </p>
            {/* Results count */}
            <div className="sei-results-count">
              Showing {products.length} products
              {searchQuery && ` for "${searchQuery}"`}
            </div>
          </div>
        </div>
        {/* Product Description End */}
        
        {/* Product Specification Start */}
        <div className="sei-specification-heqadings">
          <h6 className="sei-comman-s-heading sei-number-text">OEM NUMBER</h6>
          <h6 className="sei-comman-s-heading sei-menufacture-text">MANUFACTURER</h6>
          <h6 className="sei-comman-s-heading sei-discrption-text">DESCRIPTION</h6>
        </div>
        
        <div className="sei-accordion-container">
          {products.map((product) => (
            <div key={product.id} className="sei-accordion-column">
              <div 
                className="sei-accordion-main" 
                onClick={() => onProductClick(product)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${product.description}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onProductClick(product);
                  }
                }}
              >
                <h6 className="sei-comman-s-heading sei-number-text">
                  <span className="sei-mobile-text-n">OEM Number</span>
                  {product.oemNumber}
                </h6>
                <h6 className="sei-comman-s-heading sei-menufacture-text">
                  <span className="sei-mobile-text-n">Manufacturer</span>
                  {product.manufacturer}
                </h6>
                <h6 className="sei-comman-s-heading sei-discrption-text">
                  <span className="sei-mobile-text-n">Description</span>
                  {product.description}
                </h6>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        className="sei-product-pagination"
      />
    </div>
  );
};

