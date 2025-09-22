import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  apiCallCount: number;
  cacheHitRate: number;
}

export const usePerformanceMonitor = (componentName: string = 'Career') => {
  const startTime = useRef<number>(performance.now());
  const apiCallCount = useRef<number>(0);
  const cacheHits = useRef<number>(0);
  const totalRequests = useRef<number>(0);

  // Track API calls
  const trackApiCall = useCallback((cacheHit: boolean = false) => {
    apiCallCount.current++;
    totalRequests.current++;
    if (cacheHit) {
      cacheHits.current++;
    }
  }, []);

  // Track cache hits
  const trackCacheHit = useCallback(() => {
    cacheHits.current++;
    totalRequests.current++;
  }, []);

  // Calculate cache hit rate
  const getCacheHitRate = (): number => {
    if (totalRequests.current === 0) return 0;
    return (cacheHits.current / totalRequests.current) * 100;
  };

  // Get performance metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    const renderTime = performance.now() - startTime.current;
    return {
      renderTime,
      apiCallCount: apiCallCount.current,
      cacheHitRate: getCacheHitRate()
    };
  }, []);

  // Log performance on unmount
  useEffect(() => {
    return () => {
      const metrics = getMetrics();
      
      // Log to console in development
      if (process.env.NODE_ENV === 'production') {
      }
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'performance_metrics', {
          component: componentName,
          render_time: Math.round(metrics.renderTime),
          api_calls: metrics.apiCallCount,
          cache_hit_rate: Math.round(metrics.cacheHitRate)
        });
      }
      
      // Log slow renders
      if (metrics.renderTime > 1000) {
        console.warn(`${componentName} slow render detected: ${Math.round(metrics.renderTime)}ms`);
      }
    };
  }, [componentName, getMetrics]);

  return {
    trackApiCall,
    trackCacheHit,
    getMetrics
  };
};

