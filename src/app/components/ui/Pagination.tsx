import React from 'react';
import Icon from './Icon';

interface PaginationProps {
  currentPage: number;
  totalPages?: number; // Optional since we calculate it from totalItems/itemsPerPage
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  className = ''
}) => {
  // Normalize values to avoid edge cases
  const normalizedItemsPerPage = Math.max(1, itemsPerPage || 1);
  const derivedTotalPages = Math.ceil(totalItems / normalizedItemsPerPage) || 1;
  // Always use the calculated total pages, not the prop
  const normalizedTotalPages = Math.max(1, derivedTotalPages);
  const clampedCurrentPage = Math.min(Math.max(1, currentPage || 1), normalizedTotalPages);

  // Debug logging (can be removed in production)

  // Note: We now use a different approach for always showing ellipsis style
  const hasItems = totalItems > 0;
  const startItem = hasItems ? (clampedCurrentPage - 1) * normalizedItemsPerPage + 1 : 0;
  const endItem = hasItems ? Math.min(clampedCurrentPage * normalizedItemsPerPage, totalItems) : 0;

  if (normalizedTotalPages <= 1) {
    return showInfo ? (
      <div className={`sei-pagination-info ${className}`}>
        Showing {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </div>
    ) : null;
  }

  return (
    <div className={`sei-pagination ${className}`}>
      {showInfo && (
        <div className="sei-pagination-info">
          {hasItems ? (
            <>Showing {startItem}-{endItem} of {totalItems} items</>
          ) : (
            <>Showing 0 items</>
          )}
        </div>
      )}

      <div className="sei-pagination-controls">
        {/* Previous Page - Always show, disabled when on first page */}
        <button
          className={`sei-pagination-btn sei-pagination-btn-prev ${clampedCurrentPage <= 1 ? 'disabled' : ''}`}
          onClick={() => clampedCurrentPage > 1 && onPageChange(clampedCurrentPage - 1)}
          aria-label="Go to previous page"
          title="Previous page"
          disabled={clampedCurrentPage <= 1}
        >
          <Icon name="icon-chevron-left" size={16} />
        </button>
        {/* Page Numbers - Smart pagination with proper button display */}
        <div className="sei-pagination-pages">
          {/* Always show page 1 */}
          <button
            className={`sei-pagination-btn sei-pagination-btn-number ${1 === clampedCurrentPage ? 'active' : ''}`}
            onClick={() => onPageChange(1)}
            aria-label="Go to page 1"
            aria-current={1 === clampedCurrentPage ? 'page' : undefined}
          >
            1
          </button>

          {/* Show ellipsis if current page is far from start */}
          {clampedCurrentPage > 4 && (
            <span className="sei-pagination-ellipsis">...</span>
          )}

          {/* Show pages around current page */}
          {(() => {
            const pages = [];
            
            // Calculate the range of pages to show around current page
            let startPage = Math.max(2, clampedCurrentPage - 1);
            let endPage = Math.min(normalizedTotalPages - 1, clampedCurrentPage + 1);
            
            // Adjust range if we're near the beginning or end
            if (clampedCurrentPage <= 3) {
              endPage = Math.min(4, normalizedTotalPages - 1);
            }
            if (clampedCurrentPage >= normalizedTotalPages - 2) {
              startPage = Math.max(2, normalizedTotalPages - 3);
            }
            
            // Generate page buttons for the range
            for (let page = startPage; page <= endPage; page++) {
              if (page > 1 && page < normalizedTotalPages) {
                pages.push(
                  <button
                    key={page}
                    className={`sei-pagination-btn sei-pagination-btn-number ${page === clampedCurrentPage ? 'active' : ''}`}
                    onClick={() => onPageChange(page)}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === clampedCurrentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              }
            }
            
            return pages;
          })()}

          {/* Show ellipsis if current page is far from end */}
          {clampedCurrentPage < normalizedTotalPages - 3 && (
            <span className="sei-pagination-ellipsis">...</span>
          )}

          {/* Always show last page if more than 1 page */}
          {normalizedTotalPages > 1 && (
            <button
              className={`sei-pagination-btn sei-pagination-btn-number ${normalizedTotalPages === clampedCurrentPage ? 'active' : ''}`}
              onClick={() => onPageChange(normalizedTotalPages)}
              aria-label={`Go to page ${normalizedTotalPages}`}
              aria-current={normalizedTotalPages === clampedCurrentPage ? 'page' : undefined}
            >
              {normalizedTotalPages}
            </button>
          )}
        </div>

        {/* Next Page - Always show, disabled when on last page */}
        <button
          className={`sei-pagination-btn sei-pagination-btn-next ${clampedCurrentPage >= normalizedTotalPages ? 'disabled' : ''}`}
          onClick={() => clampedCurrentPage < normalizedTotalPages && onPageChange(clampedCurrentPage + 1)}
          aria-label="Go to next page"
          title="Next page"
          disabled={clampedCurrentPage >= normalizedTotalPages}
        >
          <Icon name="icon-chevron-right" size={16} />
        </button>


      </div>
    </div>
  );
};

export default Pagination;
