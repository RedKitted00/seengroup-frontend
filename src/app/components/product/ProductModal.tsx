import React from 'react';
import Image from 'next/image';
import { ProductFilter } from '@/lib/api/productFilterApi';
import { formatPrice } from '@/lib/utils/productUtils';

const toProxyUrl = (url: string): string => {
  if (!url) return '';

  // If it's already a full URL (starts with http/https), use it directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's already proxied, return as is
  if (url.startsWith('/api/proxy')) return url;

  // For relative URLs, add proxy prefix
  return `/api/proxy${url}`;
};

interface ProductModalProps {
  product: ProductFilter | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!product || !isOpen) return null;


  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sei-mobile-modal-overlay ${isOpen ? 'active' : ''}`}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`sei-mobile-modal ${isOpen ? 'active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="productModalTitle"
        onKeyDown={handleKeyDown}
      >
        <div className="sei-mobile-modal-grabber" aria-hidden="true"></div>

        <div className="sei-mobile-modal-header">
          <h3 id="productModalTitle">Product Details</h3>
          <button
            className="sei-mobile-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <div className="sei-mobile-modal-content">
          <div className="sei-product-modal-info">
            <div className="sei-product-modal-image">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name || product.description || 'Product image'}
                  width={300}
                  height={200}
                  className="w-full h-auto"
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  sizes="(max-width: 768px) 100vw, 300px"
                  onError={(e) => {
                    console.error('Image load error:', {
                      originalSrc: product.image,
                      processedSrc: product.image ? toProxyUrl(product.image) : 'No image',
                      error: e
                    });
                  }}
                  onLoad={() => {
                  }}
                />
              ) : (
                <div className="sei-product-modal-placeholder">
                  <i className="fa fa-image" aria-hidden="true"></i>
                  <span>No Image Available</span>
                </div>
              )}
            </div>

            <div className="sei-product-modal-details">
              <h4 className="sei-product-modal-title">{product.name}</h4>

              <div className="sei-product-modal-specs">
                {product.description && (
                  <div className="sei-spec-item">
                    <span className="sei-spec-label">
                      <i className="fa-solid fa-file-lines" aria-hidden="true"></i>
                      Description:
                    </span>
                    <span className="sei-spec-value">{product.description}</span>
                  </div>
                )}
                {product.oemNumber && (
                  <div className="sei-spec-item">
                    <span className="sei-spec-label">
                      <i className="fa fa-barcode" aria-hidden="true"></i>
                      OEM Number:
                    </span>
                    <span className="sei-spec-value sei-oem-number">{product.oemNumber}</span>
                  </div>
                )}

                {product.manufacturer && (
                  <div className="sei-spec-item">
                    <span className="sei-spec-label">
                      <i className="fa fa-industry" aria-hidden="true"></i>
                      Manufacturer:
                    </span>
                    <span className="sei-spec-value">{product.manufacturer}</span>
                  </div>
                )}
                <div className="sei-spec-item">
                  <span className="sei-spec-label">
                    Price:
                  </span>
                  <span className="sei-spec-value sei-price">
                    {product.price !== undefined && product.price !== null && `${product.price}` !== ''
                      ? `$${formatPrice(product.price)}`
                      : 'null'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="sei-product-modal-actions">
            <button
              className="sei-btn sei-btn-primary"
              onClick={() => {
                // Contact Sales functionality
                const productInfo = {
                  id: product.id,
                  name: product.name,
                  oemNumber: product.oemNumber,
                  manufacturer: product.manufacturer,
                  category: product.category,
                  subcategory: product.subcategory,
                  price: product.price
                };

                // Option 1: Navigate to contact page with product details
                const contactUrl = `/contact?product=${encodeURIComponent(JSON.stringify(productInfo))}`;
                window.open(contactUrl, '_blank');

                // Option 2: Open phone dialer (uncomment if you have a sales phone number)
                // const phoneNumber = '+1234567890'; // Replace with your sales number
                // window.open(`tel:${phoneNumber}`, '_self');

                // Option 3: Open WhatsApp with product details (uncomment if you have WhatsApp business)
                // const whatsappNumber = '1234567890'; // Replace with your WhatsApp number
                // const message = `Hi, I'm interested in ${product.description} (OEM: ${product.oemNumber})`;
                // window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

                // Option 4: Open email client (uncomment if you prefer email)
                // const subject = `Product Inquiry: ${product.description}`;
                // const body = `Hello,\n\nI'm interested in the following product:\n\nProduct: ${product.description}\nOEM Number: ${product.oemNumber}\nManufacturer: ${product.manufacturer}\nCategory: ${product.category}\nPrice: ${product.price ? `$${formatPrice(product.price)}` : 'Not specified'}\n\nPlease provide more information about availability and pricing.\n\nThank you!`;
                // window.open(`mailto:sales@yourcompany.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');

                // Close the modal after action
                onClose();
              }}
            >
              <i className="fa fa-phone" aria-hidden="true"></i>
              Contact Sales
            </button>

            <button
              className="sei-btn sei-btn-secondary"
              onClick={onClose}
            >
              <i className="fa fa-times" aria-hidden="true"></i>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

