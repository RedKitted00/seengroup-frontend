import { useEffect, useRef, useCallback } from 'react';
import { cleanNameForFilename } from '@/lib/utils/filenameUtils';

interface AdminPerformanceMetrics {
  pageLoadTime: number;
  apiCallCount: number;
  cacheHitRate: number;
  userActions: number;
  errorCount: number;
  sessionDuration: number;
}

interface AdminAction {
  type: string;
  timestamp: number;
  duration?: number;
  success: boolean;
}

export const useAdminPerformance = (pageName: string = 'Admin') => {
  const startTime = useRef<number>(performance.now());
  const apiCallCount = useRef<number>(0);
  const cacheHits = useRef<number>(0);
  const totalRequests = useRef<number>(0);
  const userActions = useRef<number>(0);
  const errorCount = useRef<number>(0);
  const actions = useRef<AdminAction[]>([]);

  // Track API calls
  const trackApiCall = useCallback((cacheHit: boolean = false, duration?: number) => {
    apiCallCount.current++;
    totalRequests.current++;
    if (cacheHit) {
      cacheHits.current++;
    }
    
    actions.current.push({
      type: 'api_call',
      timestamp: Date.now(),
      duration,
      success: true
    });
  }, []);

  // Track cache hits
  const trackCacheHit = useCallback(() => {
    cacheHits.current++;
    totalRequests.current++;
    
    actions.current.push({
      type: 'cache_hit',
      timestamp: Date.now(),
      success: true
    });
  }, []);

  // Track user actions
  const trackUserAction = useCallback((actionType: string, success: boolean = true, duration?: number) => {
    userActions.current++;
    
    actions.current.push({
      type: actionType,
      timestamp: Date.now(),
      duration,
      success
    });
  }, []);

  // Track errors
  const trackError = useCallback((errorType: string) => {
    errorCount.current++;
    
    actions.current.push({
      type: `error_${errorType}`,
      timestamp: Date.now(),
      success: false
    });
  }, []);

  // Calculate cache hit rate
  const getCacheHitRate = useCallback((): number => {
    if (totalRequests.current === 0) return 0;
    return (cacheHits.current / totalRequests.current) * 100;
  }, []);

  // Get performance metrics
  const getMetrics = useCallback((): AdminPerformanceMetrics => {
    const pageLoadTime = performance.now() - startTime.current;
    const sessionDuration = Date.now() - startTime.current;
    
    return {
      pageLoadTime,
      apiCallCount: apiCallCount.current,
      cacheHitRate: getCacheHitRate(),
      userActions: userActions.current,
      errorCount: errorCount.current,
      sessionDuration
    };
  }, [getCacheHitRate]);

  // Export performance data
  const exportPerformanceData = useCallback(() => {
    const metrics = getMetrics();
    
    // Get admin user info from session storage
    let adminUser = 'admin';
    try {
      const userData = sessionStorage.getItem('adminUser');
      if (userData) {
        const user = JSON.parse(userData);
        adminUser = user.name || user.email || 'admin';
      }
    } catch (error) {
      console.warn('Could not get admin user info:', error);
    }
    
    // Clean the admin user name for filename
    const cleanAdminName = cleanNameForFilename(adminUser);
    
    const data = {
      pageName,
      adminUser,
      metrics,
      actions: actions.current,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-performance-${cleanAdminName}-${pageName}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pageName, getMetrics]);

  // Log performance on unmount
  useEffect(() => {
    return () => {
      const metrics = getMetrics();
      
      // Log to console in development
      if (process.env.NODE_ENV === 'production') {
      }
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'admin_performance', {
          page_name: pageName,
          page_load_time: Math.round(metrics.pageLoadTime),
          api_calls: metrics.apiCallCount,
          cache_hit_rate: Math.round(metrics.cacheHitRate),
          user_actions: metrics.userActions,
          error_count: metrics.errorCount,
          session_duration: Math.round(metrics.sessionDuration)
        });
      }
      
      // Log slow loads
      if (metrics.pageLoadTime > 3000) {
        console.warn(`${pageName} slow load detected: ${Math.round(metrics.pageLoadTime)}ms`);
      }
      
      // Log high error rates
      if (metrics.errorCount > 5) {
        console.warn(`${pageName} high error count: ${metrics.errorCount} errors`);
      }
    };
  }, [pageName, getMetrics]);

  return {
    trackApiCall,
    trackCacheHit,
    trackUserAction,
    trackError,
    getMetrics,
    exportPerformanceData
  };
};

