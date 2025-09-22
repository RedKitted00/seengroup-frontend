import { useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// interface CacheOptions {
//   ttl?: number; // Time to live in milliseconds
//   key?: string; // Custom cache key
// }

export function useCache<T = unknown>(defaultTtl: number = 5 * 60 * 1000) {
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const getCached = useCallback((key: string): T | null => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    // Remove expired entry
    if (cached) {
      cacheRef.current.delete(key);
    }
    return null;
  }, []);

  const setCached = useCallback((key: string, data: T, ttl?: number) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTtl,
    });
  }, [defaultTtl]);

  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const getCacheStats = useCallback(() => {
    const entries = Array.from(cacheRef.current.entries());
    const validEntries = entries.filter(([, entry]) => 
      Date.now() - entry.timestamp < entry.ttl
    );
    
    return {
      total: entries.length,
      valid: validEntries.length,
      expired: entries.length - validEntries.length,
    };
  }, []);

  return {
    getCached,
    setCached,
    invalidateCache,
    getCacheStats,
  };
}

// Hook for API calls with caching
export function useApiCache<T = unknown>(defaultTtl: number = 5 * 60 * 1000) {
  const cache = useCache<T>(defaultTtl);

  const fetchWithCache = useCallback(async (
    url: string, 
    options?: RequestInit & { cacheKey?: string; ttl?: number }
  ): Promise<T> => {
    const cacheKey = options?.cacheKey || url;
    const ttl = options?.ttl || defaultTtl;

    // Check cache first
    const cached = cache.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the response
    cache.setCached(cacheKey, data, ttl);
    
    return data;
  }, [cache, defaultTtl]);

  return {
    fetchWithCache,
    getCached: cache.getCached,
    setCached: cache.setCached,
    invalidateCache: cache.invalidateCache,
    getCacheStats: cache.getCacheStats,
  };
}

// Hook for paginated data with caching
export function usePaginatedCache<T = unknown>(defaultTtl: number = 5 * 60 * 1000) {
  const cache = useCache<T[]>(defaultTtl);

  const getPaginatedData = useCallback((
    data: T[],
    page: number,
    pageSize: number
  ): { data: T[]; total: number; totalPages: number } => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = data.slice(start, end);
    
    return {
      data: paginatedData,
      total: data.length,
      totalPages: Math.ceil(data.length / pageSize),
    };
  }, []);

  const getCachedPaginated = useCallback((
    cacheKey: string,
    page: number,
    pageSize: number
  ): { data: T[]; total: number; totalPages: number } | null => {
    const cached = cache.getCached(cacheKey);
    if (cached) {
      return getPaginatedData(cached, page, pageSize);
    }
    return null;
  }, [cache, getPaginatedData]);

  return {
    getCachedPaginated,
    setCached: cache.setCached,
    invalidateCache: cache.invalidateCache,
    getPaginatedData,
  };
}

