import React from 'react';
import Image from 'next/image';
import { Card, Group, Badge, Text, Stack, Title } from '@mantine/core';
import { formatPrice, truncateText } from '@/lib/utils/productUtils';
import { useTranslation } from '@/lib/i18n/useTranslation';

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

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    oemNumber?: string;
    manufacturer?: string;
    price?: string | number;
    imageUrl?: string;
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
  };
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { t } = useTranslation();
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card 
      withBorder 
      radius="md" 
      p="md" 
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...(onClick && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }),
      }}
      onClick={handleClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View details for ${product.name}` : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Product Image */}
      {product.imageUrl ? (
        <Image
          src={toProxyUrl(product.imageUrl)}
          alt={product.name}
          width={300}
          height={140}
          style={{
            width: '100%',
            maxHeight: 140,
            objectFit: 'cover',
            borderRadius: 6,
            marginBottom: 8
          }}
          onError={(e) => {
            console.error('ProductCard image load error:', {
              originalSrc: product.imageUrl,
              processedSrc: product.imageUrl ? toProxyUrl(product.imageUrl) : 'No image',
              error: e
            });
          }}
        />
      ) : (
        <div 
          style={{
            width: '100%',
            height: 140,
            background: 'var(--mantine-color-dark-5)',
            borderRadius: 6,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mantine-color-dark-3)'
          }}
          aria-label="No product image available"
        >
          No Image
        </div>
      )}

      {/* Product Title and Price */}
      <Group justify="space-between" mb="xs" wrap="wrap" gap="xs">
        <Title order={4} style={{ flex: 1, minWidth: 0 }}>
          <Text 
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={product.name}
          >
            {product.name}
          </Text>
        </Title>
        {product.price && (
          <Badge variant="light" size="sm">
            ${formatPrice(product.price)}
          </Badge>
        )}
      </Group>

      {/* Product Description */}
      {product.description && (
        <Text 
          size="sm" 
          c="dimmed" 
          mb="xs"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
            minHeight: '2.8em'
          }}
          title={product.description}
        >
          {product.description}
        </Text>
      )}

      {/* Product Details */}
      <Stack gap={6}>
        {product.oemNumber && (
          <Group gap={8} wrap="nowrap">
            <Badge variant="light" size="xs" color="blue" style={{ minWidth: 'auto' }}>
              {t('products.oem')}
            </Badge>
            <Text 
              size="sm" 
              fw={500}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'monospace'
              }}
              title={product.oemNumber}
            >
              {truncateText(product.oemNumber, 30)}
            </Text>
          </Group>
        )}
        
        {product.manufacturer && (
          <Group gap={8} wrap="nowrap">
            <Badge variant="light" size="xs" color="green" style={{ minWidth: 'auto' }}>
              {t('products.brand')}
            </Badge>
            <Text 
              size="sm" 
              fw={500}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={product.manufacturer}
            >
              {truncateText(product.manufacturer, 30)}
            </Text>
          </Group>
        )}
        
        {product.category && (
          <Group gap={8} wrap="nowrap">
            <Badge variant="light" size="xs" color="orange" style={{ minWidth: 'auto' }}>
              {t('products.category')}
            </Badge>
            <Text 
              size="sm" 
              c="dimmed"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={product.category.name}
            >
              {product.category.name}
            </Text>
          </Group>
        )}
        
        {product.subcategory && (
          <Group gap={8} wrap="nowrap">
            <Badge variant="light" size="xs" color="violet" style={{ minWidth: 'auto' }}>
              {t('products.type')}
            </Badge>
            <Text 
              size="sm" 
              c="dimmed"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={product.subcategory.name}
            >
              {product.subcategory.name}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
};

