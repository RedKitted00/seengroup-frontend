"use client";

import React, { useEffect, Suspense, useState } from "react";
import {
  Container,
  Title,
  Text,
  Grid,
  Group,
  Select,
  LoadingOverlay,
  Pagination,
  Box,
  Alert,
  Button,
  TextInput,
} from "@mantine/core";
import { IconSearch, IconRefresh } from "@tabler/icons-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCardSkeleton } from "@/app/components/Skeletons";
import { ProductCard } from "@/app/components/ProductCard";
import { ProductModal } from "@/app/components/product/ProductModal";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { ProductFilter } from "@/lib/api/productFilterApi";
import { Product } from "@/hooks/useProducts";
import { useTranslation } from "@/lib/i18n/useTranslation";


function ProductsPageContent() {
  const { t } = useTranslation();
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<ProductFilter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    categories,
    selectedCategoryId,
    loading,
    categoriesLoading,
    productsLoading,
    searchTerm,
    currentPage,
    totalPages,
    selectedCategory,
    paginatedProducts,
    setSelectedCategoryId,
    setCurrentPage,
    loadCategories,
    loadProducts,
    handleSearchChange,
    refreshData,
  } = useProducts();
 
  // Handle product selection
  const handleProductClick = (product: Product) => {
    // Map Product to ProductFilter format
    const productFilter: ProductFilter = {
      id: product.id,
      name: product.name || product.description || 'Product',
      oemNumber: product.oemNumber || '',
      manufacturer: product.manufacturer || '',
      description: product.description || '',
      category: typeof product.category === 'string' ? product.category : product.category?.name || '',
      subcategory: typeof product.subcategory === 'string' ? product.subcategory : product.subcategory?.name || '',
      image: product.imageUrl || '',
      price: product.price,
      isActive: product.isActive !== undefined ? product.isActive : true,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: product.updatedAt || new Date().toISOString()
    };
    
    setSelectedProduct(productFilter);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
  
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, selectedCategoryId]);

  return (
    <ErrorBoundary>
      <Container size="xl" py="xl">
        <Group justify="space-between" mb="md" wrap="wrap" gap="xs">
          <div>
            <Title order={2}>{t('products.title')}</Title>
            <Text c="dimmed" size="sm">{t('products.subtitle')}</Text>
          </div>
          <Group gap="xs" wrap="wrap">
            <Select
              placeholder={t('products.category_placeholder')}
              data={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedCategoryId}
              onChange={(v) => setSelectedCategoryId(v || '')}
              w={{ base: "100%", xs: 260 }}
              disabled={categoriesLoading}
              aria-label={t('products.category_placeholder')}
            />
            <TextInput
              placeholder={t('products.search_placeholder')}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              w={{ base: "100%", xs: 300 }}
              aria-label={t('products.search_placeholder')}
              description={t('products.search_description')}
            />
            <Button
              className="btn btn-secondary"
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={refreshData}
              loading={loading}
              aria-label={t('products.refresh')}
            >
              {t('products.refresh')}
            </Button>
          </Group>
        </Group>

        <Text size="sm" mb="sm" className="text-light">
          {selectedCategory ? selectedCategory.name : t('common.all')} — {paginatedProducts.length} {t('products.items_count')}
        </Text>
        <Box pos="relative">
          <LoadingOverlay visible={loading} />

          <Grid>
            {productsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                  <ProductCardSkeleton />
                </Grid.Col>
              ))
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <ProductCard
                    product={{
                      id: product.id,
                      name: product.name || product.description || 'Product',
                      description: product.description,
                      oemNumber: product.oemNumber,
                      manufacturer: product.manufacturer,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      category: product.category,
                      subcategory: product.subcategory
                    }}
                    onClick={() => handleProductClick(product)}
                  />
                </Grid.Col>
              ))
            ) : (
              <Grid.Col span={12}>
                <Alert color="gray" title={t('products.no_products')}>
                  {searchTerm ? t('products.no_products_search') : t('products.no_products_category')}
                </Alert>
              </Grid.Col>
            )}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                size="md"
                aria-label={t('common.pagination')}
              />
            </Group>
          )}
        </Box>

        {/* Product Modal */}
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      </Container>
    </ErrorBoundary>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}



