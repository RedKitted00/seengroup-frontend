
"use client"
import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useProductFilter } from '@/hooks/useProductFilter';
import { FilterAccordion } from './FilterAccordion';
import { ProductList } from './ProductList';
import { ProductModal } from './ProductModal';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import Icon from '../ui/Icon';
import { useTranslation } from '@/lib/i18n/useTranslation';
import './style.css';
import Image from 'next/image';

const ProductFilterContent = () => {
  const { t } = useTranslation();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isImageAtBottom, setIsImageAtBottom] = useState(false);

  // Global error handler for runtime errors from browser extensions
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      // Suppress runtime.lastError messages from browser extensions
      if (event.message && event.message.includes('runtime.lastError')) {
        event.preventDefault();
        return;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Suppress runtime.lastError messages from browser extensions
      if (event.reason && typeof event.reason === 'string' && event.reason.includes('runtime.lastError')) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  const {
    // State
    products,
    categories,
    loading,
    error,
    searchQuery,
    activeFilters,
    activeAccordion,
    viewMode,
    selectedProduct,
    isModalOpen,
    
    // Pagination state
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    
    // Actions
    setActiveAccordion,
    
    // Functions
    handleSearch,
    handleFilterChange,
    handleViewToggle,
    openProductModal,
    closeModal,
    refreshData,
    handlePageChange,
  } = useProductFilter();

  const toggleAccordion = (category: string) => {
    setActiveAccordion(activeAccordion === category ? '' : category);
  };

  const openMobileFilter = () => setIsMobileFilterOpen(true);
  const closeMobileFilter = () => setIsMobileFilterOpen(false);

  // Handle image click for scroll effect
  const handleImageClick = () => {
    if (isImageAtBottom) {
      // Move image up (back to original position)
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      setIsImageAtBottom(false);
    } else {
      // Move image down (scroll to bottom)
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
      setIsImageAtBottom(true);
    }
  };

  // Update image position based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Check if we're near the bottom (within 100px)
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;
      setIsImageAtBottom(isNearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ErrorBoundary>
      <section className="sei-product-filter" id="sw-product-parts-section">
        <div className="sei-product-filter-container">
          {/* Left Side Sidebar - Hidden on mobile */}
          <div className="sei-product-filter-sidebar">
            <div className="sei-accordion">
              {/* Categories */}
              <FilterAccordion
                title={t('products.categories')}
                category="auxiliary"
                isActive={activeAccordion === 'auxiliary'}
                onToggle={toggleAccordion}
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
                dataId="133"
                categories={categories}
                filterCount={activeFilters.auxiliary.length}
              />
            </div>

            {/* Contact CTA */}
            <div className="sei-contact-cta">
              <div className="sei-cta-content">
                <h4>{t('products.need_help')}</h4>
                <p>{t('products.contact_sales_description')}</p>
                <Link href="/contact" className="sei-btn sei-btn-primary">{t('products.contact_sales')}</Link>
              </div>
            </div>
          </div>

          {/* Right Side Product List */}
          <div className="sei-product-filter-Product-List">
            <div className="sei-filters-option">
              {/* Mobile Filter Button */}
              <div className="sei-mobile-filter-btn-container">
                <button 
                  className="sei-mobile-filter-btn"
                  onClick={openMobileFilter}
                  aria-label="Open filters"
                >
                  <Icon name="icon-filter" size={16} />
                  <span>{t('products.filters')}</span>
                  {Object.values(activeFilters).some(filters => filters.length > 0 && !filters.includes('Show All')) && (
                    <span className="sei-mobile-filter-badge">
                      {Object.values(activeFilters).reduce((total, filters) => 
                        total + filters.filter((f: string) => f !== 'Show All').length, 0
                      )}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile Global Search */}
              <div className="sei-mobile-search" role="search">
                <input 
                  type="text" 
                  className="sei-mobile-global-search-input" 
                  placeholder={t('products.search_products')} 
                  aria-label="Search products"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <button className="sei-mobile-global-search-btn" aria-label="Search">
                  <Icon name="icon-search" size={16} />
                </button>
              </div>
              
              {/* Filter Status and Clear Button */}
              <div className="sei-col-option-filter">
                <a 
                  href="#" 
                  className={`sei-sw-layout-filter ${viewMode === 'list' ? 'active' : ''}`} 
                  data-view="list"
                  onClick={(e) => {
                    e.preventDefault();
                    handleViewToggle('list');
                  }}
                >
                  <Icon name="icon-list" size={16} />
                </a>
                <a 
                  href="#" 
                  className={`sei-sw-layout-filter ${viewMode === 'grid' ? 'active' : ''}`} 
                  data-view="grid"
                  onClick={(e) => {
                    e.preventDefault();
                    handleViewToggle('grid');
                  }}
                >
                  <Icon name="icon-grid" size={16} />
                </a>
              </div>
            </div>

            {/* Product List */}
            <ProductList
              products={products}
              loading={loading}
              error={error}
              viewMode={viewMode}
              searchQuery={searchQuery}
              onProductClick={openProductModal}
              onRetry={refreshData}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {isMobileFilterOpen && (
          <div className="sei-mobile-filter-overlay">
            <div className="sei-mobile-filter-content">
              <div className="sei-mobile-filter-header">
                <h3>{t('products.filters')}</h3>
                <button 
                  className="sei-mobile-filter-close"
                  onClick={closeMobileFilter}
                  aria-label="Close filters"
                >
                  <Icon name="icon-cross" size={20} />
                </button>
              </div>
              
              <div className="sei-mobile-filter-body">
                {/* Mobile Categories Accordion */}
                <div className="sei-mobile-accordion">
                  <FilterAccordion
                    title={t('products.categories')}
                    category="auxiliary"
                    isActive={activeAccordion === 'auxiliary'}
                    onToggle={toggleAccordion}
                    onFilterChange={handleFilterChange}
                    activeFilters={activeFilters}
                    dataId="133"
                    categories={categories}
                    filterCount={activeFilters.auxiliary.length}
                  />
                </div>

                {/* Mobile Contact CTA */}
                <div className="sei-mobile-contact-cta">
                  <div className="sei-cta-content">
                    <h4>{t('products.need_help')}</h4>
                    <p>{t('products.contact_sales_description')}</p>
                    <Link href="/contact" className="sei-btn sei-btn-primary">{t('products.contact_sales')}</Link>
                  </div>
                </div>
              </div>

              <div className="sei-mobile-filter-footer">
                <button 
                  className="sei-btn sei-btn-secondary"
                  onClick={() => {
                    // Clear all filters logic
                    Object.keys(activeFilters).forEach(key => {
                      handleFilterChange(key as keyof typeof activeFilters, 'Show All', true);
                    });
                  }}
                >
                  {t('products.clear_all')}
                </button>
                <button 
                  className="sei-btn sei-btn-primary"
                  onClick={closeMobileFilter}
                >
                  {t('products.apply_filters')}
                </button>
              </div>
            </div>
          </div>
        )}
        
      </section>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
        <div 
          className="sei-product-img" 
          style={{ 
            position: 'fixed', 
            right: '16px', 
            bottom: '16px', 
            zIndex: 9999,
            cursor: 'pointer',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform: isImageAtBottom ? 'scale(0.9)' : 'scale(1)',
            opacity: isImageAtBottom ? '0.8' : '1'
          }}
          onClick={handleImageClick}
          title={isImageAtBottom ? 'Click to scroll to top' : 'Click to scroll to bottom'}
        >
            <Image 
              src="https://pub-8b25a422bd234ffab965d339ba7bc4aa.r2.dev/product-images_modern-diesel.png"
              alt="Product category overview"
              width={200}
              height={200}
              className="sei-product-image"
              priority
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              sizes="200px"
            />
            {/* Visual indicator */}
            <div 
              style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                opacity: isImageAtBottom ? '1' : '0',
                transition: 'opacity 0.3s ease'
              }}
            >
              {isImageAtBottom ? t('products.scroll_to_top') : t('products.scroll_to_bottom')}
            </div>
          </div>
    </ErrorBoundary>
  );
};

const ProductFilter = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductFilterContent />
    </Suspense>
  );
};

export default ProductFilter;
