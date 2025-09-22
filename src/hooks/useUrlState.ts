import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export const useUrlState = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const updateUrl = useCallback((updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === 0) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [searchParams, pathname, router]);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    updateUrl({ search: term, page: 1 }); // Reset page when searching
  }, [updateUrl]);

  const updateCategoryId = useCallback((id: string) => {
    setCategoryId(id);
    updateUrl({ category: id, page: 1 }); // Reset page when changing category
  }, [updateUrl]);

  const updatePage = useCallback((newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
  }, [updateUrl]);

  // Sync URL params with state on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlPage = parseInt(searchParams.get('page') || '1');

    if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
    if (urlCategory !== categoryId) setCategoryId(urlCategory);
    if (urlPage !== page) setPage(urlPage);
  }, [searchParams, searchTerm, categoryId, page]);

  return {
    searchTerm,
    categoryId,
    page,
    updateSearchTerm,
    updateCategoryId,
    updatePage,
  };
};

